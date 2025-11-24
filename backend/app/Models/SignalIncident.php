<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SignalIncident extends Model
{
    
    protected $table = "signal_incident";
    protected $primaryKey = "idS";
    protected $fillable = [
        'type',
        'dateS',
        'descriptionS',
        'statut',
        'nbProduit',
        'id_infirmier',
        'id_magasinier',
        'idP'
    ];

    public function infirmier(){
        return $this->belongsTo(Infirmiers::class, 'id_infirmier');
    }

    public function magasinier(){
        return $this->belongsTo(Magasiniers::class, 'id_magasinier');
    }

    public function produit(){
        return $this->belongsTo(Produit::class, 'idP');
    }
}
