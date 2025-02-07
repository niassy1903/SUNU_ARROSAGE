<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UtilisateurController;
use App\Http\Controllers\HistoriqueController;


/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});


// routes/api.php



Route::post('/login-by-code', [UtilisateurController::class, 'loginByCode']); //connexion
Route::post('/logout', [UtilisateurController::class, 'logout']); //déconnexion
// Route pour récupérer tous les enregistrements d'historique
Route::get('/historiques', [HistoriqueController::class, 'index']);

    Route::post('/utilisateurs', [UtilisateurController::class, 'create']); //créer user

    Route::get('/utilisateurs/{id}', [UtilisateurController::class, 'getUtilisateur']); //récupère user par son id
    Route::get('/utilisateurs', [UtilisateurController::class, 'list']); //afficher liste 
    Route::delete('/utilisateurs/{id}', [UtilisateurController::class, 'delete']); //supprimer
    Route::delete('/utilisateurs', [UtilisateurController::class, 'deleteMultiple']); //suppression multiple
    Route::put('/utilisateurs/{id}', [UtilisateurController::class, 'update']); //modifier
    Route::get('/utilisateurs/check-telephone/{telephone}', [UtilisateurController::class, 'checkTelephoneExists']);
    Route::get('/utilisateurs/check-carte-rfid/{carte_rfid}', [UtilisateurController::class, 'checkCarteRfidExists']);
