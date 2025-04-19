<?php
header('Content-Type: application/json');

// Email configuration
$adminEmail = "ceo@missstarinternational.com";
$emailSubject = "New Application - Miss Star International 2025";

// Validate and sanitize input data
$fullName = filter_input(INPUT_POST, 'full_name', FILTER_SANITIZE_STRING);
$email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
$country = filter_input(INPUT_POST, 'country', FILTER_SANITIZE_STRING);
$age = filter_input(INPUT_POST, 'age', FILTER_SANITIZE_NUMBER_INT);
$biography = filter_input(INPUT_POST, 'biography', FILTER_SANITIZE_STRING);
$socialImpact = filter_input(INPUT_POST, 'social_impact', FILTER_SANITIZE_STRING);

// Validate required fields
if (!$fullName || !$email || !$country || !$age || !$biography) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Please fill in all required fields.'
    ]);
    exit;
}

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Please enter a valid email address.'
    ]);
    exit;
}

// Validate age
if ($age < 18 || $age > 120) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Age must be between 18 and 120.'
    ]);
    exit;
}

// Prepare email content
$emailContent = "
New Application Received

Full Name: $fullName
Email: $email
Country: $country
Age: $age

Biography:
$biography

Social Impact Platform:
$socialImpact

Date: " . date('Y-m-d H:i:s') . "
IP Address: " . $_SERVER['REMOTE_ADDR'] . "
";

// Send email
$headers = [
    'From' => 'noreply@missstarinternational.com',
    'Reply-To' => $email,
    'X-Mailer' => 'PHP/' . phpversion()
];

$mailSent = mail($adminEmail, $emailSubject, $emailContent, $headers);

if ($mailSent) {
    echo json_encode([
        'success' => true,
        'message' => 'Your application has been received successfully! We will contact you soon.'
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'There was an error processing your application. Please try again later.'
    ]);
}
