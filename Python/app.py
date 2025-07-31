from flask import Flask, render_template, request, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
import random

app = Flask(__name__)
app.secret_key = 'supersecretkey'

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///voting_system.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Database Models
class Voter(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    voter_id = db.Column(db.Integer, unique=True, nullable=False)
    fingerprint = db.Column(db.Integer, nullable=False)

class Vote(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    voter_id = db.Column(db.Integer, db.ForeignKey('voter.voter_id'), nullable=False)
    candidate = db.Column(db.String(50), nullable=False)

# Initialize the database (run this once to create tables)
@app.before_first_request
def create_tables():
    db.create_all()

# Candidate list
candidates = ["Alice", "Bob", "Charlie"]

# Home page
@app.route('/')
def home():
    return render_template('home.html')

# Register Voter
@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        name = request.form['name']
        voter_id = random.randint(1000, 9999)
        fingerprint = random.randint(10000, 99999)  # Simulated fingerprint data

        # Add voter to database
        new_voter = Voter(name=name, voter_id=voter_id, fingerprint=fingerprint)
        db.session.add(new_voter)
        db.session.commit()

        flash(f'Voter Registered! ID: {voter_id}, Fingerprint: {fingerprint}')
        return redirect(url_for('home'))
    return render_template('register.html')

# Authenticate Voter
@app.route('/authenticate', methods=['GET', 'POST'])
def authenticate():
    if request.method == 'POST':
        voter_id = int(request.form['voter_id'])
        fingerprint = int(request.form['fingerprint'])
        
        # Check voter in database
        voter = Voter.query.filter_by(voter_id=voter_id, fingerprint=fingerprint).first()
        
        if voter:
            flash(f'Voter authenticated: {voter.name}')
            return redirect(url_for('vote', voter_id=voter_id))
        else:
            flash('Authentication failed!')
            return redirect(url_for('home'))
    return render_template('authenticate.html')

# Cast Vote
@app.route('/vote/<int:voter_id>', methods=['GET', 'POST'])
def vote(voter_id):
    if request.method == 'POST':
        candidate = request.form['candidate']
        
        # Check if the voter has already voted
        existing_vote = Vote.query.filter_by(voter_id=voter_id).first()
        if existing_vote:
            flash('You have already voted!')
            return redirect(url_for('home'))

        # Cast vote
        new_vote = Vote(voter_id=voter_id, candidate=candidate)
        db.session.add(new_vote)
        db.session.commit()

        flash(f'Vote cast successfully for {candidate}')
        return redirect(url_for('results'))

    return render_template('vote.html', candidates=candidates)

# Results
@app.route('/results')
def results():
    # Query votes from database
    vote_count = {candidate: 0 for candidate in candidates}
    votes = Vote.query.all()
    
    for vote in votes:
        vote_count[vote.candidate] += 1
    
    return render_template('results.html', vote_count=vote_count)

if __name__ == '__main__':
    app.run(debug=True)
