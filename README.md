#  SkateParadise

**SkateParadise** est une application **e-commerce** développée avec **Django** (backend) et **React** (frontend).  
Elle permet également la **gestion complète d’un site de vente de produits de skate**, avec une interface **administrateur** pour gérer les **utilisateurs**, **produits** et **commandes**.

---

## 🚀 Fonctionnalités principales

- 🧾 **Gestion des produits** : ajout, modification, suppression depuis l’admin Django  
- 🛒 **Panier dynamique** : ajout et suppression d’articles côté client  
- 👤 **Gestion des utilisateurs** : inscription, connexion, déconnexion  
- 💳 **Commandes** : création et enregistrement des commandes dans la base de données  
- ⚙️ **Interface administrateur complète** : gestion des stocks, suivi des commandes  
- 🌐 **Frontend réactif** avec **React** et **Axios** pour les appels à l’API Django REST  

---

## 🧰 Technologies utilisées

### Backend :
- Django  
- Django REST Framework  
- MySQL / SQLite (selon ta configuration)  

### Frontend :
- React (avec Hooks et composants fonctionnels)  
- Axios  
- HTML / CSS  

---
Installation :

1) git clone https://github.com/terrielama/cda_projet.git

2) Créer un environnement virtuel et l'activer
 python -m venv env
.env\Scripts\activate

3) Installer les dépendances
pip install -r requirements.txt

4) Appliquer les migrations
 cd skateparadise
 python manage.py makemigrations
 python manage.py migrate

5) Lancer le serveur Django
 python manage.py runserver 8001

6) Lancer React  
 cd frontend
 npm install
 npm run dev

---
A quoi ressemble le site :

 Desktop : 
 
 - Accueil
<img width="900" height="420" alt="home (1)" src="https://github.com/user-attachments/assets/998b5ea9-ea70-4947-87f4-810fe08ff45d" />
<img width="900" height="420" alt="home3" src="https://github.com/user-attachments/assets/821a8018-d76c-4da1-93cb-54520046dcb2" />
<img width="900" height="420" alt="home2" src="https://github.com/user-attachments/assets/8244aa5f-74d0-4a04-98b2-c20f7c1cdc3f" />


 - Produit

<img width="900" height="420" alt="produit" src="https://github.com/user-attachments/assets/46fbf9a8-1697-499b-973f-55bfd3cc1b84" />

 - Connexion et inscription 
<img width="900" height="420" alt="connexion" src="https://github.com/user-attachments/assets/f4e87543-c89a-4b86-882c-9f0d211c387e" />
<img width="900" height="420" alt="inscr" src="https://github.com/user-attachments/assets/67a0b760-4928-45d8-91cc-a8d30a42ae4c" />


 - Panier

<img width="900" height="420" alt="panier" src="https://github.com/user-attachments/assets/397f82fb-8baa-4748-a73e-9f2dba6cba96" />
<img width="900" height="420" alt="panier2" src="https://github.com/user-attachments/assets/a6533fda-3dae-4a7c-89dd-8f82c15acc93" />


---
Mobile :

 - Accueil
<img width="145" height="320" alt="home1" src="https://github.com/user-attachments/assets/1f9f2b2c-40de-4d92-b4ff-1e8cea4fcb1d" />
<img width="145" height="320" alt="home" src="https://github.com/user-attachments/assets/8e501790-92d5-42fd-82c8-000a92188067" />



 - Produit 
<img width="148" height="320" alt="product" src="https://github.com/user-attachments/assets/23a6a679-361a-459d-8631-8c6e4a6db50b" />

---
Optionnel
Pour acccéder à l'interface d’administration :
Créer un superutilisateur (admin Django)
python manage.py createsuperuser

Ensuite se connecter sur :
 http://localhost:8001/admin

<img width="952" height="420" alt="admin" src="https://github.com/user-attachments/assets/f45a974d-d4a2-4740-9bcd-aec7a87b393c" />






