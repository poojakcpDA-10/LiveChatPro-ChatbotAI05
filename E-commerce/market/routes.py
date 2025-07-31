from market import app, db
from flask import render_template, redirect, url_for, flash, request
from market.modals import Item, User
from market.form import RegisterForm, LoginForm, PurchaseForm, SellForm
from flask_login import login_user, logout_user, login_required, current_user

@app.route('/')
@app.route('/home')
def home_page():
    return render_template('home.html')

@app.route('/market', methods=['GET','POST'])
@login_required
def market_page():
    purchase_form = PurchaseForm()
    sell_form = SellForm()
    if request.method =='POST':
        purchased_item = request.form.get('purchased_item')
        p_item_obj = Item.query.filter_by(name = purchased_item).first()
        
        if p_item_obj:
            if current_user.can_purchase(p_item_obj):
                p_item_obj.buy(current_user)
                flash(f'Congrats! you have successfully purchased {p_item_obj.name} for {p_item_obj.price}$', category = 'success')
            else:
                flash(f'Unfortunately! you dont have enough money to buy {p_item_obj.name}', category = 'danger')
        sold_item = request.form.get('sold_item')
        s_item_obj = Item.query.filter_by(name = sold_item).first()
        if s_item_obj:
            if current_user.can_sell(s_item_obj):
                s_item_obj.sell(current_user)
                flash(f'Congrats! You have successfully sold {s_item_obj.name} for {s_item_obj.price}', category='success')
            else:
                flash(f'Something went wrong!', category='danger')

        return redirect(url_for('market_page'))
            
    if request.method == 'GET':
        items = Item.query.filter_by(owner=None)
        count = Item.query.count()
        owned_items = Item.query.filter_by(owner = current_user.id)
        return render_template('market.html', items=items, count= count,  purchase_form = purchase_form, owned_items = owned_items, sell_form = sell_form)
    

@app.route('/register', methods =['GET','POST'])
def register():
    form = RegisterForm()
    if form.validate_on_submit():
        with app.app_context():
            user_to_create = User(username = form.username.data,
                                email_address = form.email_address.data,
                                password1 = form.password.data)
            
            db.session.add(user_to_create)
            db.session.commit()
            login_user(user_to_create)
            flash(f'Account created successfully! Now you logged in as {user_to_create.username}', category = 'info')
        return redirect(url_for('market_page'))
    else:
        for error_msg in form.errors.values():
            flash(f'There is error in creating user: {error_msg}', category = 'danger')

    return render_template('register.html', form = form)

@app.route('/login', methods=['GET','POST'])
def login_page():
    form = LoginForm()
    if form.validate_on_submit():
        attempted_user = User.query.filter_by(username= form.username.data).first()
        if  attempted_user and attempted_user.check_password_correction(attempted_password = form.password.data):
            login_user(attempted_user)
            flash(f'Success! You logged in as {attempted_user.username}',category='success')
            return redirect(url_for('market_page'))
        else:
            flash(f'Incorrect username & password', category = 'danger')
      
    return render_template('login.html', form=form)

@app.route('/logout')
def logout_page():
    logout_user()
    flash('You have logged out!', category = 'info')
    return redirect(url_for('home_page'))
