<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
ini_set('display_errors', '0');
function finish(int $status): void {
    http_response_code($status);
    echo json_encode(['ok' => $status === 200]);
    exit;
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    finish(405);
}
if ((int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 65536) finish(413);
function field(string $name): string {
    return is_string($_POST[$name] ?? null) ? trim($_POST[$name]) : '';
}
$channel = field('channel');
$contact = field('contact');
$message = field('message');
$token = field('smart-token');
$email = $channel === 'email' && filter_var($contact, FILTER_VALIDATE_EMAIL);
$telegram = $channel === 'telegram' && preg_match('/^@?[A-Za-z0-9_]{1,32}$/D', $contact);
if ((!$email && !$telegram) || strlen($contact) > 254 || $message === '' ||
    strlen($message) > 16000 || $token === '' || strlen($token) > 12000) finish(422);

try {
    // Jino layout: ~/domains/web-dock.ru/api and ~/private/web-dock.
    $configPath = dirname(__DIR__, 3) . '/private/web-dock/contact.php';
    $config = is_file($configPath) ? require $configPath : [];
    $secret = $config['SMARTCAPTCHA_SERVER_KEY'] ?? getenv('SMARTCAPTCHA_SERVER_KEY');
    $password = $config['YANDEX_SMTP_APP_PASSWORD'] ?? getenv('YANDEX_SMTP_APP_PASSWORD');
    $dbPath = $config['CONTACT_STATE_DB'] ?? getenv('CONTACT_STATE_DB');
    if (!$secret || !$password || !$dbPath) finish(503);
    $db = new PDO('sqlite:' . $dbPath, null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    $db->exec('PRAGMA busy_timeout=3000');
    $db->exec('CREATE TABLE IF NOT EXISTS attempts (client TEXT, ts INTEGER)');
    $db->exec('CREATE TABLE IF NOT EXISTS deliveries (id TEXT PRIMARY KEY, ts INTEGER, sent INTEGER)');
    $client = hash_hmac('sha256', $_SERVER['REMOTE_ADDR'] ?? '', $secret);
    $now = time();
    $db->exec('BEGIN IMMEDIATE');
    $db->prepare('DELETE FROM attempts WHERE ts < ?')->execute([$now - 600]);
    $db->prepare('DELETE FROM deliveries WHERE ts < ?')->execute([$now - 3600]);
    $count = $db->prepare('SELECT count(*), count(CASE WHEN client = ? THEN 1 END) FROM attempts');
    $count->execute([$client]);
    [$total, $perClient] = $count->fetch(PDO::FETCH_NUM);
    $count->closeCursor();
    if ($total >= 150 || $perClient >= 10) {
        $db->exec('COMMIT');
        finish(429);
    }
    $db->prepare('INSERT INTO attempts VALUES (?, ?)')->execute([$client, $now]);
    $db->exec('COMMIT');

    $captcha = curl_init('https://smartcaptcha.cloud.yandex.ru/validate');
    curl_setopt_array($captcha, [CURLOPT_POSTFIELDS => http_build_query(['secret'=>$secret,'token'=>$token]),
        CURLOPT_RETURNTRANSFER=>true, CURLOPT_TIMEOUT=>6]);
    $reply = curl_exec($captcha);
    if ($reply === false || curl_getinfo($captcha, CURLINFO_RESPONSE_CODE) !== 200) finish(503);
    $check = json_decode($reply, true);
    if (($check['status'] ?? '') !== 'ok' || !in_array($check['host'] ?? '', ['web-dock.ru','www.web-dock.ru'], true)) finish(403);

    $id = hash_hmac('sha256', implode("\0", [$channel, $contact, $message]), $secret);
    $claim = $db->prepare('INSERT OR IGNORE INTO deliveries VALUES (?, ?, 0)');
    $claim->execute([$id, $now]);
    if ($claim->rowCount() === 0) {
        $existing = $db->prepare('SELECT sent FROM deliveries WHERE id = ?');
        $existing->execute([$id]);
        finish((int) $existing->fetchColumn() === 1 ? 200 : 409);
    }
    $mailbox = 'clyde@nxt.ru';
    $body = chunk_split(base64_encode("Канал: $channel\nКонтакт: $contact\n\n$message"));
    $stream = fopen('php://temp', 'w+b');
    fwrite($stream, "From: WEB-DOCK <$mailbox>\r\nTo: <$mailbox>\r\nSubject: WEB-DOCK project request\r\n"
        . 'Date: ' . date(DATE_RFC2822) . "\r\nMIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\n"
        . "Content-Transfer-Encoding: base64\r\n\r\n" . $body);
    rewind($stream);
    $smtp = curl_init('smtps://smtp.yandex.ru:465');
    curl_setopt_array($smtp, [CURLOPT_USERNAME=>$mailbox, CURLOPT_PASSWORD=>$password,
        CURLOPT_MAIL_FROM=>$mailbox, CURLOPT_MAIL_RCPT=>[$mailbox], CURLOPT_UPLOAD=>true,
        CURLOPT_INFILE=>$stream, CURLOPT_TIMEOUT=>18, CURLOPT_RETURNTRANSFER=>true]);
    if (curl_exec($smtp) === false) {
        // A timeout after DATA has an ambiguous delivery outcome. Keep its claim.
        if (in_array(curl_errno($smtp), [CURLE_COULDNT_CONNECT, CURLE_COULDNT_RESOLVE_HOST, CURLE_LOGIN_DENIED], true)) {
            $db->prepare('DELETE FROM deliveries WHERE id = ?')->execute([$id]);
        }
        finish(503);
    }
    $db->prepare('UPDATE deliveries SET sent = 1 WHERE id = ?')->execute([$id]);
    finish(200);
} catch (Throwable $error) {
    finish(503);
}
