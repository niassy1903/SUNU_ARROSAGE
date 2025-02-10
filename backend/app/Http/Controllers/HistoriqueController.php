<?php

namespace App\Http\Controllers;

use App\Models\Historique;
use Illuminate\Http\Request;

class HistoriqueController extends Controller
{
    // Récupérer tous les historiques
    public function index()
    {
        $historiques = Historique::with('utilisateur')->get();
        return response()->json(['historiques' => $historiques], 200);
    }

    // Récupérer les historiques d'un utilisateur spécifique
    public function show($userId)
    {
        $historiques = Historique::where('user_id', $userId)->with('utilisateur')->get();
        return response()->json(['historiques' => $historiques], 200);
    }

    // Récupérer les historiques filtrés par date
    public function filterByDate(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date',
        ]);

        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        $historiques = Historique::with('utilisateur')
                                 ->whereBetween('date_heure', [$startDate, $endDate])
                                 ->get();

        return response()->json(['historiques' => $historiques], 200);
    }
}
