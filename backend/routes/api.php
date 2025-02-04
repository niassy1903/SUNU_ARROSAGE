<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UtilisateurController;

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



Route::post('/login-by-code', [UtilisateurController::class, 'loginByCode']);
Route::post('/logout', [UtilisateurController::class, 'logout']);

//Route::middleware(['check.super_admin'])->group(function () {
    Route::post('/utilisateurs', [UtilisateurController::class, 'create']);



    Route::get('/utilisateurs/{id}', [UtilisateurController::class, 'getUtilisateur']);
    Route::get('/utilisateurs', [UtilisateurController::class, 'list']);
    Route::delete('/utilisateurs/{id}', [UtilisateurController::class, 'delete']);
    Route::delete('/utilisateurs', [UtilisateurController::class, 'deleteMultiple']);
    Route::put('/utilisateurs/{id}', [UtilisateurController::class, 'update']);
    Route::get('/utilisateurs/check-telephone/{telephone}', [UtilisateurController::class, 'checkTelephoneExists']);
    Route::get('/utilisateurs/check-carte-rfid/{carte_rfid}', [UtilisateurController::class, 'checkCarteRfidExists']);
//});