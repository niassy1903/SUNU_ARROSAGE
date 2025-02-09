<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Votre Code Secret</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        .logo {
            max-width: 150px;
        }
        h2 {
            color: #28BC89;
        }
        .code {
            font-size: 24px;
            font-weight: bold;
            color: #333;
            background: #f8f8f8;
            padding: 10px;
            display: inline-block;
            border-radius: 5px;
            margin: 10px 0;
        }
        .btn {
            display: inline-block;
            padding: 10px 20px;
            background: #28BC89;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-size: 16px;
        }
        .footer {
            margin-top: 20px;
            font-size: 12px;
            color: #777;
        }
    </style>
</head>
<body>

<div class="container">
    <img src="{{ asset('storage/logo.png') }}" alt="Logo" class="logo">
    <h2>Bonjour {{ $nom }} {{ $prenom }},</h2>
    <p>Voici votre code secret pour accéder à votre compte :</p>
    <div class="code">{{ $code_secret }}</div>
    <p><a href="{{ config('app.frontend_url') }}" class="btn">Se connecter</a></p>
    <p class="footer">Si vous n'avez pas demandé ce code, ignorez simplement cet email.</p>
</div>

</body>
</html>
