<?php

$host = 'localhost';
$dbname = 'The Wholesale King Ltd
_services';
$username = 'your_db_username';
$password = 'your_db_password';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

try {

    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('Invalid JSON input');
    }
    
    // Validate required fields based on form type
    $formType = $input['formType'] ?? 'contact';
    $requiredFields = [];
    
    switch ($formType) {
        case 'contactForm':
            $requiredFields = ['firstName', 'lastName', 'email', 'subject', 'message'];
            break;
        case 'greenhouseForm':
            $requiredFields = ['name', 'email', 'phone', 'service'];
            break;
        case 'quoteForm':
            $requiredFields = ['name', 'email', 'phone', 'size'];
            break;
        default:
            throw new Exception('Invalid form type');
    }

    foreach ($requiredFields as $field) {
        if (empty($input[$field])) {
            throw new Exception("Required field missing: $field");
        }
    }

    $email = filter_var($input['email'], FILTER_VALIDATE_EMAIL);
    if (!$email) {
        throw new Exception('Invalid email format');
    }

    if (isset($input['phone'])) {
        $phone = preg_replace('/[^0-9]/', '', $input['phone']);
        if (strlen($phone) < 10) {
            throw new Exception('Invalid phone number');
        }
    }

    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false
    ]);

    $data = [
        'form_type' => $formType,
        'first_name' => $input['firstName'] ?? $input['name'] ?? '',
        'last_name' => $input['lastName'] ?? '',
        'email' => $email,
        'phone' => $input['phone'] ?? '',
        'company' => $input['company'] ?? '',
        'subject' => $input['subject'] ?? $input['service'] ?? '',
        'message' => $input['message'] ?? $input['notes'] ?? '',
        'additional_data' => json_encode($input),
        'ip_address' => $_SERVER['REMOTE_ADDR'] ?? '',
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
        'created_at' => date('Y-m-d H:i:s')
    ];

    $sql = "INSERT INTO contact_submissions (
        form_type, first_name, last_name, email, phone, company, 
        subject, message, additional_data, ip_address, user_agent, created_at
    ) VALUES (
        :form_type, :first_name, :last_name, :email, :phone, :company,
        :subject, :message, :additional_data, :ip_address, :user_agent, :created_at
    )";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($data);

    $to = 'thewholesalekingltd@gmail.com';
    $emailSubject = "New {$formType} submission from {$data['first_name']} {$data['last_name']}";
    $emailBody = "
        New form submission received:
        
        Form Type: {$formType}
        Name: {$data['first_name']} {$data['last_name']}
        Email: {$data['email']}
        Phone: {$data['phone']}
        Company: {$data['company']}
        Subject: {$data['subject']}
        Message: {$data['message']}
        
        Submitted at: {$data['created_at']}
        IP Address: {$data['ip_address']}
    ";
    
    $headers = "From: noreply@The Wholesale King Ltd
services.com\r\n";
    $headers .= "Reply-To: {$data['email']}\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    
    mail($to, $emailSubject, $emailBody, $headers);
    echo json_encode([
        'success' => true,
        'message' => 'Form submitted successfully',
        'id' => $pdo->lastInsertId()
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
