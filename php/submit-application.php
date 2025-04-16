<?php
/**
 * Miss Star International Application Form Handler
 * This script processes and validates form submissions from the application form.
 * It sends the information via email and stores a backup copy locally.
 */

// Set error reporting and headers
error_reporting(E_ALL);
ini_set('display_errors', 0);
header('Content-Type: application/json');

// Define email settings
$admin_email = "applications@missstarinternational.com";
$cc_email = "info@missstarinternational.com";
$from_email = "noreply@missstarinternational.com";

// Configuration
$max_file_size = 10 * 1024 * 1024; // 10MB
$allowed_extensions = ['jpg', 'jpeg', 'png', 'pdf'];
$upload_dir = __DIR__ . '/../uploads/';

// Create upload directory if it doesn't exist
if (!file_exists($upload_dir)) {
    mkdir($upload_dir, 0755, true);
}

// Function to sanitize input
function sanitize_input($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

// Function to validate email
function is_valid_email($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

// Initialize response array
$response = [
    'success' => false,
    'message' => '',
    'errors' => []
];

// Check if form was submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    // Collect form data
    $full_name = isset($_POST['full_name']) ? sanitize_input($_POST['full_name']) : '';
    $email = isset($_POST['email']) ? sanitize_input($_POST['email']) : '';
    $age = isset($_POST['age']) ? intval($_POST['age']) : 0;
    $country = isset($_POST['country']) ? sanitize_input($_POST['country']) : '';
    $city = isset($_POST['city']) ? sanitize_input($_POST['city']) : '';
    $biography = isset($_POST['biography']) ? sanitize_input($_POST['biography']) : '';
    $social_media = isset($_POST['social_media']) ? sanitize_input($_POST['social_media']) : '';
    $language = isset($_POST['language']) ? sanitize_input($_POST['language']) : 'en';
    
    // Validate required fields
    if (empty($full_name)) {
        $response['errors'][] = 'Full name is required';
    }
    
    if (empty($email) || !is_valid_email($email)) {
        $response['errors'][] = 'Valid email address is required';
    }
    
    if ($age < 18 || $age > 120) {
        $response['errors'][] = 'Age must be between 18 and 120';
    }
    
    if (empty($country)) {
        $response['errors'][] = 'Country is required';
    }
    
    if (empty($biography)) {
        $response['errors'][] = 'Biography is required';
    } else {
        // Check biography word count
        $word_count = str_word_count($biography);
        if ($word_count > 200) {
            $response['errors'][] = 'Biography exceeds the 200 word limit';
        }
    }
    
    // Process photo upload if exists
    $photo_path = '';
    if (isset($_FILES['photo']) && $_FILES['photo']['error'] == 0) {
        $file_tmp = $_FILES['photo']['tmp_name'];
        $file_name = $_FILES['photo']['name'];
        $file_size = $_FILES['photo']['size'];
        $file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
        
        // Validate file size and extension
        if ($file_size > $max_file_size) {
            $response['errors'][] = 'Photo file size must not exceed 10MB';
        }
        
        if (!in_array($file_ext, $allowed_extensions)) {
            $response['errors'][] = 'Only JPG, JPEG, PNG, and PDF files are allowed';
        }
        
        // If no errors, save the file
        if (empty($response['errors'])) {
            $new_file_name = uniqid() . '_' . time() . '.' . $file_ext;
            $photo_path = $upload_dir . $new_file_name;
            
            if (!move_uploaded_file($file_tmp, $photo_path)) {
                $response['errors'][] = 'Failed to upload photo';
            }
        }
    }
    
    // If no errors, process the application
    if (empty($response['errors'])) {
        // Prepare email content
        $subject = "New Miss Star Application: " . $full_name;
        
        $message = "New Miss Star International Application\n\n";
        $message .= "Full Name: " . $full_name . "\n";
        $message .= "Email: " . $email . "\n";
        $message .= "Age: " . $age . "\n";
        $message .= "Country: " . $country . "\n";
        $message .= "City: " . $city . "\n";
        $message .= "Biography: " . $biography . "\n";
        $message .= "Social Media: " . $social_media . "\n";
        $message .= "Submission Date: " . date("Y-m-d H:i:s") . "\n";
        
        // Prepare email headers
        $headers = "From: " . $from_email . "\r\n";
        $headers .= "Reply-To: " . $email . "\r\n";
        $headers .= "CC: " . $cc_email . "\r\n";
        
        // If we have a photo, attach it
        $attachment = '';
        if (!empty($photo_path)) {
            $message .= "Photo attached.\n";
            // Note: Real email attachment would require using a library like PHPMailer
        }
        
        // Save application to a log file
        $log_data = $message . "\n--------------------------------------------------\n";
        file_put_contents($upload_dir . 'applications.log', $log_data, FILE_APPEND);
        
        // Send email (in a real environment, consider using PHPMailer or similar)
        $mail_sent = mail($admin_email, $subject, $message, $headers);
        
        if ($mail_sent) {
            $response['success'] = true;
            $response['message'] = $language === 'es' ? 
                'Tu solicitud ha sido recibida. ¡Nos pondremos en contacto contigo pronto!' : 
                'Your application has been received! We\'ll be in touch soon.';
        } else {
            $response['message'] = $language === 'es' ? 
                'Hubo un problema al enviar tu solicitud. Por favor, inténtalo de nuevo más tarde.' : 
                'There was a problem submitting your application. Please try again later.';
            
            // Log error for server-side debugging
            error_log("Failed to send application email for " . $full_name . " (" . $email . ")");
        }
    } else {
        $response['message'] = $language === 'es' ? 
            'Por favor, corrige los errores en el formulario.' : 
            'Please correct the errors in the form.';
    }
} else {
    $response['message'] = 'Invalid request method';
}

// Return JSON response
echo json_encode($response); 