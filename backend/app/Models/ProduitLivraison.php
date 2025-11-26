<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProduitLivraison extends Model
{
    //
    protected $table = 'produit_livraisons';
    protected $primaryKey = 'id';
    protected $fillable = ['id', 'idL', 'idP', 'quantite'];


    public function livraison()
    {
        return $this->belongsTo(Livraison::class, 'idP','id');
    }
    public function produit()
    {
        return $this->belongsTo(Produit::class, 'idP','idP');
    }
}
