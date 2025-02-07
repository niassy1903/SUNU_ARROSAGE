<?php

namespace App\Http\Controllers;

use App\Models\Utilisateur;
use App\Models\Historique;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Notifications\CodeSecretNotification;
use Carbon\Carbon;
use Tymon\JWTAuth\Facades\JWTAuth;



class UtilisateurController extends Controller
{
    private function logAction($userId, $nom, $prenom, $action)
    {
        $now = Carbon::now();
        Historique::create([
            'user_id' => $userId,
            'nom' => $nom,
            'prenom' => $prenom,
            'action' => $action,
            'date' => $now->toDateString(), // Enregistre la date
            'heure' => $now->toTimeString(), // Enregistre l'heure
        ]);
    }
    public function create(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'role' => 'required|in:admin_simple,super_admin',
            'telephone' => 'required|string|max:20|unique:utilisateurs',
            'adresse' => 'required|string|max:255',
            'carte_rfid' => 'nullable|string|max:255|unique:utilisateurs',
            'email' => 'required|email|unique:utilisateurs',
        ], [
            'nom.required' => 'Le nom est requis.',
            'prenom.required' => 'Le prénom est requis.',
            'role.required' => 'Le rôle est requis.',
            'telephone.required' => 'Le numéro de téléphone est requis.',
            'telephone.unique' => 'Ce numéro de téléphone existe déjà.',
            'adresse.required' => 'L\'adresse est requise.',
            'carte_rfid.unique' => 'Cette carte RFID existe déjà.',
            'email.required' => 'L\'email est requis.',
            'email.unique' => 'Cet email existe déjà.',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        $matricule = $this->generateMatricule($request->role);
        $code_secret = $this->generateCodeSecret();

        $utilisateur = Utilisateur::create([
            'nom' => $request->nom,
            'prenom' => $request->prenom,
            'matricule' => $matricule,
            'code_secret' => $code_secret,
            'carte_rfid' => $request->carte_rfid,
            'role' => $request->role,
            'telephone' => $request->telephone,
            'adresse' => $request->adresse,
            'email' => $request->email,
        ]);

        // Envoyer la notification
        $utilisateur->notify(new CodeSecretNotification($code_secret, $request->prenom, $request->nom));

        // Enregistrer l'action
        $this->logAction($utilisateur->id, $utilisateur->nom, $utilisateur->prenom, 'Création d\'utilisateur');

        return response()->json(['message' => 'Utilisateur créé avec succès', 'utilisateur' => $utilisateur], 201);
    }

    public function list()
    {
        $utilisateurs = Utilisateur::all();
        return response()->json(['utilisateurs' => $utilisateurs], 200);
    }

    public function delete($id)
    {
        $utilisateur = Utilisateur::find($id);
        if (!$utilisateur) {
            return response()->json(['error' => 'Utilisateur non trouvé'], 404);
        }

        // Enregistrer l'action avant la suppression
        $this->logAction($utilisateur->id, $utilisateur->nom, $utilisateur->prenom, 'Suppression d\'utilisateur');

        $utilisateur->delete();
        return response()->json(['message' => 'Utilisateur supprimé avec succès'], 200);
    }

    public function deleteMultiple(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ids' => 'required|array',
            'ids.*' => 'exists:utilisateurs,_id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        $ids = $request->input('ids');
        $utilisateurs = Utilisateur::whereIn('_id', $ids)->get();

        foreach ($utilisateurs as $utilisateur) {
            // Enregistrer l'action pour chaque utilisateur supprimé
            $this->logAction($utilisateur->id, $utilisateur->nom, $utilisateur->prenom, 'Suppression multiple d\'utilisateurs');
        }

        Utilisateur::whereIn('_id', $ids)->delete();

        return response()->json(['message' => 'Utilisateurs supprimés avec succès'], 200);
    }

    public function update(Request $request, $id)
    {
        $utilisateur = Utilisateur::find($id);
        if (!$utilisateur) {
            return response()->json(['error' => 'Utilisateur non trouvé'], 404);
        }
        $rules = [
            'nom' => 'sometimes|string|max:255',
            'prenom' => 'sometimes|string|max:255',
            'role' => 'sometimes|in:admin_simple,super_admin',
            'adresse' => 'sometimes|string|max:255',
            'email' => 'sometimes|email',
        ];
        // Vérifier si les champs ont été envoyés avant d'appliquer la validation unique
        if ($request->has('email') && $request->email !== $utilisateur->email) {
            $rules['email'] = 'email|unique:utilisateurs,email,' . $id;
        }

        if ($request->has('telephone') && $request->telephone !== $utilisateur->telephone) {
            $rules['telephone'] = 'string|max:20|unique:utilisateurs,telephone,' . $id;
        }

        if ($request->has('carte_rfid') && $request->carte_rfid !== $utilisateur->carte_rfid) {
            $rules['carte_rfid'] = 'string|max:255|unique:utilisateurs,carte_rfid,' . $id;
        }

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        $utilisateur->update($request->only(array_keys($rules)));

        // Enregistrer l'action après la mise à jour
        $this->logAction($utilisateur->id, $utilisateur->nom, $utilisateur->prenom, 'Mise à jour d\'utilisateur');

        return response()->json([
            'message' => 'Utilisateur mis à jour avec succès',
            'utilisateur' => $utilisateur
        ], 200);
    }
    

    public function getUtilisateur($id)
    {
        $utilisateur = Utilisateur::find($id);
        if (!$utilisateur) {
            return response()->json(['error' => 'Utilisateur non trouvé'], 404);
        }
        return response()->json(['utilisateur' => $utilisateur], 200);
    }

    public function checkTelephoneExists($telephone)
    {
        $exists = Utilisateur::where('telephone', $telephone)->exists();
        return response()->json(['exists' => $exists], 200);
    }

    public function checkCarteRfidExists($carte_rfid)
    {
        $exists = Utilisateur::where('carte_rfid', $carte_rfid)->exists();
        return response()->json(['exists' => $exists], 200);
    }

    private function generateMatricule($role)
    {
        $prefix = $role === 'admin_simple' ? 'AS' : 'SP';
        $randomNumber = str_pad(mt_rand(0, 999), 3, '0', STR_PAD_LEFT);
        return $prefix . '-' . $randomNumber;
    }

    private function generateCodeSecret()
    {
        return str_pad(mt_rand(0, 9999), 4, '0', STR_PAD_LEFT);
    }

    public function blockMultiple(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ids' => 'required|array',
            'ids.*' => 'exists:utilisateurs,_id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        $ids = $request->input('ids');
        $utilisateurs = Utilisateur::whereIn('_id', $ids)->get();

        foreach ($utilisateurs as $utilisateur) {
            // Enregistrer l'action pour chaque utilisateur bloqué
            $this->logAction($utilisateur->id, $utilisateur->nom, $utilisateur->prenom, 'Blocage multiple d\'utilisateurs');
        }

        Utilisateur::whereIn('_id', $ids)->update(['status' => 'inactif']);

        return response()->json(['message' => 'Utilisateurs bloqués avec succès'], 200);
    }

    public function switchRole(Request $request, $id)
    {
        $utilisateur = Utilisateur::find($id);
        if (!$utilisateur) {
            return response()->json(['error' => 'Utilisateur non trouvé'], 404);
        }

        // Basculer entre 'admin_simple' et 'super_admin'
        $newRole = ($utilisateur->role === 'admin_simple') ? 'super_admin' : 'admin_simple';
        $utilisateur->role = $newRole;
        $utilisateur->save();

        // Enregistrer l'action après le changement de rôle
        $this->logAction($utilisateur->id, $utilisateur->nom, $utilisateur->prenom, 'Changement de rôle');

        return response()->json(['message' => 'Rôle mis à jour avec succès', 'utilisateur' => $utilisateur], 200);
    }

    public function importCsv(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'csv_file' => 'required|mimes:csv,txt',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        $file = $request->file('csv_file');
        $csvData = array_map('str_getcsv', file($file));
        $header = array_shift($csvData);

        $expectedHeader = ['nom', 'prenom', 'role', 'telephone', 'adresse', 'email', 'carte_rfid'];
        if ($header !== $expectedHeader) {
            return response()->json(['error' => 'L\'ordre des champs dans le CSV est incorrect. Veuillez suivre cet ordre : ' . implode(', ', $expectedHeader)], 400);
        }

        foreach ($csvData as $row) {
            $data = array_combine($header, $row);
            $utilisateur = Utilisateur::create([
                'nom' => $data['nom'],
                'prenom' => $data['prenom'],
                'role' => $data['role'],
                'telephone' => $data['telephone'],
                'adresse' => $data['adresse'],
                'email' => $data['email'],
                'carte_rfid' => $data['carte_rfid'] ?? null,
                'matricule' => $this->generateMatricule($data['role']),
                'code_secret' => $this->generateCodeSecret(),
            ]);

            // Enregistrer l'action après l'importation de chaque utilisateur
            $this->logAction($utilisateur->id, $utilisateur->nom, $utilisateur->prenom, 'Importation d\'utilisateur');
        }

        return response()->json(['message' => 'Utilisateurs importés avec succès'], 201);
    }

    public function assigner_carte(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'carte_rfid' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        // Vérifier si la carte RFID existe déjà pour un autre utilisateur
        $carteExists = Utilisateur::where('carte_rfid', $request->carte_rfid)
                                  ->where('_id', '<>', $id)
                                  ->exists();

        if ($carteExists) {
            return response()->json(['error' => 'Cette carte RFID existe déjà.'], 400);
        }

        $utilisateur = Utilisateur::find($id);
        if (!$utilisateur) {
            return response()->json(['error' => 'Utilisateur non trouvé'], 404);
        }

        $utilisateur->carte_rfid = $request->carte_rfid;
        $utilisateur->save();

        // Enregistrer l'action après l'assignation de la carte
        $this->logAction($utilisateur->id, $utilisateur->nom, $utilisateur->prenom, 'Assignation de carte RFID');

        return response()->json(['message' => 'Carte RFID assignée avec succès', 'utilisateur' => $utilisateur], 200);
    }

    public function loginByCode(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code_secret' => 'required|numeric|digits:4',  
        ]);
    
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }
    
        $code_secret = $request->input('code_secret');
        $utilisateur = Utilisateur::where('code_secret', $code_secret)->first();
    
        if ($utilisateur) {
            // Générer un token JWT pour l'utilisateur
            $token = JWTAuth::fromUser($utilisateur);
            
            return response()->json([
                'message' => 'Connexion réussie',
                'token' => $token,
                'user' => [
                    'nom' => $utilisateur->nom,
                    'prenom' => $utilisateur->prenom,
                    'role' => $utilisateur->role
                ]
            ], 201);
        } else {
            return response()->json(['error' => 'Code incorrect'], 401);
        }
    }
    

    public function logout(Request $request)
    {
        $token = $request->bearerToken();
    
        if (!$token) {
            return response()->json(['error' => 'Token non fourni'], 400);
        }
    
        try {
            // Optionnel : vérifier si le token est valide avant d'invalider
            $tokenPayload = JWTAuth::setToken($token)->getPayload();
    
            if ($tokenPayload) {
                JWTAuth::invalidate($token);
                return response()->json(['message' => 'Déconnexion réussie'], 200);
            }
    
            return response()->json(['error' => 'Token invalide ou expiré'], 401);
            
        } catch (\Tymon\JWTAuth\Exceptions\TokenExpiredException $e) {
            return response()->json(['error' => 'Le token est déjà expiré'], 401);
        } catch (\Tymon\JWTAuth\Exceptions\TokenInvalidException $e) {
            return response()->json(['error' => 'Token invalide'], 401);
        } catch (\Tymon\JWTAuth\Exceptions\JWTException $e) {
            return response()->json(['error' => 'Impossible d\'invalider le token'], 500);
        }
    }

}
