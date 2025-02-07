<?php
// app/Http/Controllers/UtilisateurController.php

namespace App\Http\Controllers;

use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;
use App\Notifications\CodeSecretNotification;
use Illuminate\Support\Facades\Notification;

//use Tymon\JWTAuth\Exceptions\JWTException;

class UtilisateurController extends Controller
{
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

        // Envoyer l'email avec le code secret
        Notification::send($utilisateur, new CodeSecretNotification($code_secret, $request->nom, $request->prenom));

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

    public function loginByCode(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code_secret' => 'required|numeric|digits:4',  // Validation du code secret :chiffre uniquement avec longueur 4
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

    public function loginByRfid(Request $request)
    {
        // Validation du champ 'carte_rfid'
        $validator = Validator::make($request->all(), [
            'carte_rfid' => 'required|string|max:255',
        ]);
    
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }
    
        // Récupérer la carte RFID
        $carte_rfid = $request->input('carte_rfid');
    
        // Recherche de l'utilisateur par carte RFID
        $utilisateur = Utilisateur::where('carte_rfid', $carte_rfid)->first();
    
        if ($utilisateur) {
            // Générer un token JWT
            $token = JWTAuth::fromUser($utilisateur);
    
            // Réponse avec le token et les informations utilisateur
            return response()->json([
                'message' => 'Connexion réussie',
                'token' => $token,
                'user' => [
                    'nom' => $utilisateur->nom,
                    'prenom' => $utilisateur->prenom,
                    'role' => $utilisateur->role
                ]
            ], 200); // Code HTTP 200 pour une réussite
        } else {
            // Erreur si la carte RFID n'est pas trouvée
            return response()->json(['error' => 'Carte RFID incorrecte'], 401); // Code HTTP 401 pour non autorisé
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
