<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UtilisateurController;
use App\Http\Controllers\HistoriqueController;



Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});


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



// routes/api.php

Route::post('/login-by-code', [UtilisateurController::class, 'loginByCode']); //connexion
Route::post('/logout', [UtilisateurController::class, 'logout']); //déconnexion
Route::post('/login-by-card', [UtilisateurController::class, 'loginByCard']);


// routes/api.php

//use App\Http\Controllers\HistoriqueController;

Route::get('/historiques', [HistoriqueController::class, 'index']);
Route::get('/historiques/{userId}', [HistoriqueController::class, 'show']);
Route::get('/historiques/filter', [HistoriqueController::class, 'filterByDate']);


Route::post('/utilisateurs', [UtilisateurController::class, 'create']);
Route::get('/utilisateurs/{id}', [UtilisateurController::class, 'getUtilisateur']);
Route::get('/utilisateurs', [UtilisateurController::class, 'list']);
Route::delete('/utilisateurs/{id}', [UtilisateurController::class, 'delete']);
Route::delete('/utilisateurs', [UtilisateurController::class, 'deleteMultiple']);
Route::put('/utilisateurs/{id}', [UtilisateurController::class, 'update']);
Route::get('/utilisateurs/check-telephone/{telephone}', [UtilisateurController::class, 'checkTelephoneExists']);
Route::get('/utilisateurs/check-carte-rfid/{carte_rfid}', [UtilisateurController::class, 'checkCarteRfidExists']);

Route::post('/utilisateurs/block-multiple', [UtilisateurController::class, 'blockMultiple']);
Route::post('/utilisateurs/switch-role/{id}', [UtilisateurController::class, 'switchRole']);

Route::post('/utilisateurs/import-csv', [UtilisateurController::class, 'importCsv']);



Route::post('/utilisateurs/assigner-carte/{id}', [UtilisateurController::class, 'assigner_carte']);
