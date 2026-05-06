# FreshMart - Online Grocery Management 

## Requirements

- Java 17+
- Maven
- XAMPP (MySQL). Start Apache and MySQL in XAMPP Control Panel.

## Setup

1. **Database**: Start MySQL in XAMPP. The app will create database `freshmart_db` and tables automatically on first run (JPA `ddl-auto=update`).

2. **MySQL user**: Default is `root` with no password. If you use a password, edit `src/main/resources/application.properties`:
    - `spring.datasource.password=your_password`

## Run

```bash
run intelliJ IDEA 2025.3.2
```
```bash
run XAMPP Control Panel
```
## After Running intellij & XAMPP

Open in browser : **http://localhost:8080**

- **Home/Store**: http://localhost:8080/order.html
- **Login**     : http://localhost:8080/login.html
- **Register**  : http://localhost:8080/register.html


- **Admin Dashboard**: http://localhost:8080/admin.html (login as admin first)
- **Add Product**: http://localhost:8080/add-product.html
- **Product List** (view, edit, remove, add quantity): http://localhost:8080/product-list.html

## Data Storage

- **Admin accounts**: `MySQL table` (email|password per line)
- **Customer details**: `MySQL table` (name|email|address|password per line)
- **Products**: `MySQL table` products
- **Product quantity entries**: `MySQL table` `product_quantity` (product_id, quantity, where_bought, created_at date/time set automatically)

## Features

- No limit on account creation or image upload size
- Image preview on Add Product page **only after upload** (no preview on file select)
- Product list: view, edit, remove, add quantity (product id, quantity, where bought, auto date/time)
