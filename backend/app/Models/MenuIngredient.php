<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MenuIngredient extends Model
{
    protected $fillable = ['menu_id', 'ingredient_id', 'quantity_needed'];
}
