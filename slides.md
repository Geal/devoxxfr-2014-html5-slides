% Rust
% Clément Delafargue & Geoffroy Couprie
% 17 Avril 2014

<section class="slide cover title">
  <div>
  <div class="color1"></div><div class="color2"></div><div class="color3"></div>
  <h1>Programmation système</h1>
  <img src="pictures/circuit_board.jpg" alt="">
  <p class="footer">
  <a class="hashtag" href="https://twitter.com/search?q=%23devoxxrust">#devoxxrust</a>
  <span class="twitter"><img src="pictures/twitter.png"><a href="https://twitter.com/clementd" rel="me" class="twitter">@clementd</a></span> /
  <span class="twitter"><a href="https://twitter.com/gcouprie" rel="me" class="twitter">@gcouprie</a></span></p>
  </div>
</section>

<section class="slide">
<div>
## le CPU, zone de non-droit

<img src="pictures/barbecue.jpg"  style="float:right" height="300px" />

* exécution directe sur CPU
* manipulation directe de la mémoire
* intégration avec d'autres applications


<!--Loin du monde merveilleux des VM avec GC et compilation JIT-->
</div>
</section>

<section class="slide">
<div>
## Pourquoi un langage bas-niveau ?

<!-- Il y a des use cases qu’un langage à VM ne peut pas remplir:-->
* driver kernel
* bibliothèque importable dans d’autres langages
* multicore
* indépendance du GC et de ses pauses
* embarquer dans un langage à GC
</div>
</section>

<section class="slide">
<div>
## Les langages Old School

<img src ="pictures/pointers.jpg" style="float:right" />

* C
* C++
* Fortran

</div>
</section>

<section class="slide">
<div>
## Aucune assurance

<img src="pictures/bufferoverflow.jpg" style="float:right" />

* Pas de vérification du format des données
* gestion d’erreurs ardue
* null pointer dereference
* buffer overflows
* heap overflows
* double free
* etc.

</div>
</section>

<section class="slide">
<div>

## Y a pas de bug dans mon code
```text
Program received signal SIGSEGV, Segmentation fault.
0x1c0007a8 in main () at main.c:6
```
</div>
</section>

<section class="slide cover title">
  <div>
  <div class="color1"></div><div class="color2"></div><div class="color3"></div>
  <h1>Rust</h1>
  <img src="pictures/rusty_gear.jpg" alt="">
  <p class="footer">
  <a class="hashtag" href="https://twitter.com/search?q=%23devoxxrust">#devoxxrust</a>
  <span class="twitter"><img src="pictures/twitter.png"><a href="https://twitter.com/clementd" rel="me" class="twitter">@clementd</a></span> /
  <span class="twitter"><a href="https://twitter.com/gcouprie" rel="me" class="twitter">@gcouprie</a></span></p>
  </div>
</section>

<section class="slide">
<div>
## Buts du langage

<img src="pictures/rust.jpg" height="400px" style="float:right" />

* bas niveau
* portable
* memory safe
* concurrence
* parallélisme

</div>
</section>

<section class="slide">
<div>
## Memory safe

* gérer la mémoire à la place du développeur
* supprimer des classes de bugs entières dans le compilateur

```text
    Do not kill bugs, kill bug classes
```

<!--Même les meilleurs développeurs font des erreurs, et un certain nombre d’entre elles peuvent être repérées grâce à un compilateur intelligent et un langage qui donne suffisamment d’informations au compilateur.-->

</div>
</section>

<section class="slide">
<div>
## Un monde sans GC ?

3 méthodes de stockage de données:

* statique (dure aussi longtemps que le process)
* stack (dure aussi longtemps que le bloc courant)
* heap (zone mémoire allouée et relâchée à la demande)

</div>
</section>

<section class="slide">
<div>

## Statique

```rust
fn main() {
  println!("hello world");
}
```

</div>
</section>

<section class="slide">
<div>
## Stack

```rust
fn f() -> &uint {
  let s = 1;
  let r = &s;
  r
}
fn main() {
  println!("{}", f());
}
```

```text
static.rs:3:11: 3:13 error: `s` does not live long enough
static.rs:3   let r = &s;
```

</div>
</section>

<section class="slide">
<div>
## Stack: l'erreur complète

```text
static.rs:3:11: 3:13 error: `s` does not live long enough
static.rs:3   let r = &s;
                      ^~
static.rs:1:17: 5:2 note: reference must be valid for the
anonymous lifetime #1 defined on the block at 1:16...
static.rs:1 fn f() -> &uint {
static.rs:2   let s = 1;
static.rs:3   let r = &s;
static.rs:4   r
static.rs:5 }
static.rs:1:17: 5:2 note: ...but borrowed value is only
valid for the block at 1:16
static.rs:1 fn f() -> &uint {
static.rs:2   let s = 1;
static.rs:3   let r = &s;
static.rs:4   r
static.rs:5 }
error: aborting due to previous error
```

</div>
</section>

<section class="slide">
<div>
## Heap

```rust
fn f() -> ~str {
  let s = ~"hello world";
  s
}
fn main() {
  println!("{}", f());
}
```

</div>
</section>

<section class="slide">
<div>

## Ownership

```rust
fn main() {
  let s = ~"hello world";
  spawn(proc() {
    println!("other task: {}", s);
  });
  println!("main task {}", s);
}
```
```text
borrow.rs:6:28: 6:29 error: use of moved value: `s`
borrow.rs:6   println!("main task {}", s);
                                       ^
[...]
borrow.rs:3:9: 5:4 note: `s` moved into closure environment
here because it has type `proc:Send()`,which is non-copyable
(perhaps you meant to use clone()?)
borrow.rs:3   spawn(proc() {
borrow.rs:4     println!("other task: {}", s);
borrow.rs:5   });
```

<!--En C:
une zone statique est modifiable, on peut pointer sur un morceau de stack après être sorti du bloc, on peut oublier de désallouer une zone mémoire (fuite), on peut désallouer une zone mémoire plusieurs fois (double free)
-->
</div>
</section>

<section class="slide">
<div>
## Ca peut être unsafe

```rust
use std::cast;
let mut x: u8 = 1;

let ref_1: &mut u8 = &mut x;
let ref_2: &mut u8 = unsafe {
  cast::transmute_mut_region(ref_1)
};

// ref_1 et ref_2 pointent vers la même zone mémoire
*ref_1 = 10;
*ref_2 = 20;
```
</div>
</section>

<section class="slide">
<div>
## On peut écrire de l'assembleur

```rust
fn add(a: int, b: int) -> int {
  let mut c = 0;
  unsafe {
    asm!("add $2, $0"
         : "=r"(c)
         : "0"(a), "r"(b)
         );
  }
  c
}
```
</div>
</section>

<section class="slide">
<div>

## GC

<img src="pictures/aintnogc.jpg" style="float:right" />
Ca existe, mais...

</div>
</section>

<section class="slide">
<div>
## Que propose Rust?

* données immutables par défaut, mutables à la demande
* gestion du scope d’une variable (ajout automatique de malloc/free)
* gestion de l’ownership (on ne peut modifier une zone mémoire gérée par un autre thread)
* les manipulations non vérifiables sont isolées
</div>
</section>

<section class="slide">
<div>
</div>
</section>

<section class="slide">
<div>

</div>
</section>

<section class="slide">
<div>

## L’immutabilité
L’immutabilité par défaut change beaucoup de choses
une donnée passée à une fonction ne sera pas modifiée -> pour un même input, on obtient un même output
mutabilité à la demande -> on isole la mutabilité dans des fonctions définies, on ne peut pas appliquer des fonctions avec arguments mutables à des données immutables
on ne partage pas de données mutables entre threads -> pas de problème de synchronisation (deadlocks, races, etc)
si une donnée ne change pas, le compilateur peut exploiter cette information pour des optimisations

</div>
</section>

<section class="slide">
<div>

## Concurrence
Rust implémente le modèle CSP. Plusieurs tasks (green threads) s’exécutant sur un pool de threads (mode M:N), ou une task par thread (mode 1:1). Ces tasks communiquent par des channels à sens unique ou double sens, asynchrones (un mode synchrone est dispo, il me semble).
Une task peut embarquer des données du contexte de la task qui l’a lancée (elle en prend l’ownership). Les channels sont typés, donc les données qui y circulent sont garanties de ce type, dès la compilation.

</div>
</section>

<section class="slide">
<div>

## Système de types
Rust est un langage statiquement et fortement typé. Le compilateur vérifie que toutes les opérations (assignments, appels de fonction, etc) sont cohérentes avec les types. De cette manière, la vérification du format des données est faite à la compilation, sans coût supplémentaire au runtime.
L’inférence de types est utilisée dès que possible, pour réduire l’impact sur la quantité de code à écrire.
Toutes les conversion d’un type à un autre sont spécifiées explicitement et empêchent les erreurs.
Notamment, Rust interdit les pointeurs null. Un pointeur (ou une référence) doit toujours être lié à une donnée valide (si la donnée n’existe plus le pointeur n’est plus utilisable et le compilateur renvoie une erreur).
Les informations de type n’ont pas d’impact sur le runtime, car ils servent principalement à décrire les interactions entre composants, et la position des membres d’une structure. Rust fournit des énumérations et du pattern matching pour les fonctions qui peuvent recevoir plusieurs type différents.
-> exemple de pattern matching, Option<T>


</div>
</section>

<section class="slide">
<div>

## Traits
Rust ne force pas le développement dans un paradigme particulier. A la base, on utilise des structs comme en C. on peut passer ces structs comme argument et retour d’une fonction.
On peut appliquer un set de méthodes à un type en déclarant un Trait, et ainsi fournir un paradigme objet. Les traits peuvent hériter entre eux, pour proposer une sorte d’héritage de classes, mais ce n’est pas le fonctionnement le plus pratique.
Il est plus intéressant d’employer les traits génériques. on peut ainsi spécifier qu’un trait peut s’appliquer à n’importe quel type, ou à un type qui a une implémentation d’un autre trait.
-> insérer ici la discussion autour de “plus c’est générique, plus ça restreint les implémentations possibles”
Des implémentations de certains traits peuvent être dérivés automatiquement d’une struct, rendant leur utilisation plus simple

</div>
</section>

<section class="slide">
<div>

## Crates, modules, etc
Les bibliothèques sont nommées des crates, on les appelle par “extern crate XXX;”. On ne peut utiliser que des fonctions ou traits qui ont été importés (quoique certains sont récupérables par inférence)
Dépendance non transitives: on ne peut pas utiliser un crate qui a été importé par l’une des dépendances, il faut l’importer explicitement.

</div>
</section>

<section class="slide">
<div>

Process de développement en rust:
définition de la structure comportant les données nécessaires en entrée et en sortie
écriture des constructeurs. Généralement, définition d’une structure mutable en interne, et on renvoie une structure immutable
Définition des types d’erreur Option, Result, etc)
écriture des opérations de transformation de données
-> le compilateur se plaint -> pester 30mn devant son clavier, se plaindre sur IRC -> voir que le compilateur avait raison (un état global est planqué dans un coin, une variable est utilisée après être supprimée, accès concurrents à une donnée, etc) -> corriger humblement -> recommencer
Une fois les transformations écrites, l’exécution du code dans des tâches séparées se fait facilement, grâce aux channels typés et à l’immutabilité
Un programme Rust fonctionne en pipeline:
on récupère des données en input dans un format incertain, on les parse (ou rejette) vers un format interne
comme le format interne est bien spécifié, on applique toutes les transformations que l’on veut dessus, sans souci
on renvoie les données
Ca permet d’isoler l’IO et les problèmes de concurrence de la partie importante du code


</div>
</section>

