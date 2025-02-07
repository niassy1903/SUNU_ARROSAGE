<?php

namespace App\Http\Controllers;

use App\Models\historique;
//use App\Models\Utilisateur;
use Illuminate\Http\Request;
use App\Http\Controllers\UtilisateurController;

class HistoriqueController extends Controller
{
    /**
     * Récupère tous les enregistrements d'historique avec les informations de l'utilisateur associé.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        // Récupère tous les enregistrements d'historique avec les relations 'utilisateur'
        $historiques = Historique::with('utilisateur')->get();

        // Retourne les enregistrements d'historique au format JSON
        return response()->json(['historiques' => $historiques], 200);
    }
}
