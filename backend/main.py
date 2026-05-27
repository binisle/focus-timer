from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime, timedelta
import json
import os

app = Flask(__name__)
CORS(app)

DATA_FILE = 'data.json'

def load_data():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    return {
        "subjects": [
            {"id": 1, "name": "Work"},
            {"id": 2, "name": "Reading"},
            {"id": 3, "name": "Exercise"},
            {"id": 4, "name": "Study"}
        ],
        "sessions": [],
        "next_subject_id": 5,
        "next_session_id": 1
    }

def save_data(data):
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f)

# Subjects
@app.route('/subjects', methods=['GET'])
def get_subjects():
    data = load_data()
    return jsonify(data['subjects'])

@app.route('/subjects', methods=['POST'])
def create_subject():
    data = load_data()
    body = request.get_json()
    new_subject = {"id": data['next_subject_id'], "name": body['name']}
    data['subjects'].append(new_subject)
    data['next_subject_id'] += 1
    save_data(data)
    return jsonify(new_subject)

@app.route('/subjects/<int:id>', methods=['DELETE'])
def delete_subject(id):
    data = load_data()
    data['subjects'] = [s for s in data['subjects'] if s['id'] != id]
    save_data(data)
    return jsonify({"success": True})

# Sessions
@app.route('/sessions', methods=['GET'])
def get_sessions():
    data = load_data()
    sessions = data['sessions']
    subject_id = request.args.get('subject_id')
    range_filter = request.args.get('range', 'all')
    now = datetime.now()

    if range_filter == 'week':
        start = now - timedelta(days=now.weekday())
        start = start.replace(hour=0, minute=0, second=0)
        sessions = [s for s in sessions if datetime.fromisoformat(s['created_at']) >= start]
    elif range_filter == 'month':
        start = now.replace(day=1, hour=0, minute=0, second=0)
        sessions = [s for s in sessions if datetime.fromisoformat(s['created_at']) >= start]

    if subject_id:
        sessions = [s for s in sessions if s['subject_id'] == int(subject_id)]

    subjects = {s['id']: s['name'] for s in data['subjects']}
    result = []
    for s in sessions:
        result.append({
            "id": s['id'],
            "subject_id": s['subject_id'],
            "subject_name": subjects.get(s['subject_id'], 'Unknown'),
            "duration": s['duration'],
            "created_at": s['created_at']
        })
    return jsonify(result)

@app.route('/sessions', methods=['POST'])
def create_session():
    data = load_data()
    body = request.get_json()
    now = datetime.now().isoformat()
    new_session = {
        "id": data['next_session_id'],
        "subject_id": body['subject_id'],
        "duration": body['duration'],
        "created_at": now
    }
    data['sessions'].append(new_session)
    data['next_session_id'] += 1
    save_data(data)
    subjects = {s['id']: s['name'] for s in data['subjects']}
    return jsonify({**new_session, "subject_name": subjects.get(new_session['subject_id'], 'Unknown')})

@app.route('/sessions/<int:id>', methods=['DELETE'])
def delete_session(id):
    data = load_data()
    data['sessions'] = [s for s in data['sessions'] if s['id'] != id]
    save_data(data)
    return jsonify({"success": True})

# Stats
@app.route('/stats', methods=['GET'])
def get_stats():
    data = load_data()
    sessions = data['sessions']
    now = datetime.now()

    # Total hours
    total_minutes = sum(s['duration'] for s in sessions)
    total_hours = round(total_minutes / 60, 1)

    # Sessions this week
    week_start = now - timedelta(days=now.weekday())
    week_start = week_start.replace(hour=0, minute=0, second=0)
    sessions_this_week = len([s for s in sessions if datetime.fromisoformat(s['created_at']) >= week_start])

    # Streak
    streak = 0
    check_date = now.date()
    while True:
        day_sessions = [s for s in sessions if datetime.fromisoformat(s['created_at']).date() == check_date]
        if day_sessions:
            streak += 1
            check_date -= timedelta(days=1)
        else:
            break

    # By subject
    subject_minutes = {}
    subjects = {s['id']: s['name'] for s in data['subjects']}
    for s in sessions:
        name = subjects.get(s['subject_id'], 'Unknown')
        subject_minutes[name] = subject_minutes.get(name, 0) + s['duration']
    by_subject = [{"name": k, "minutes": v} for k, v in subject_minutes.items()]

    # By weekday
    weekdays = {'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0}
    day_map = {0: 'Mon', 1: 'Tue', 2: 'Wed', 3: 'Thu', 4: 'Fri', 5: 'Sat', 6: 'Sun'}
    for s in sessions:
        day = datetime.fromisoformat(s['created_at']).weekday()
        weekdays[day_map[day]] += s['duration']

    return jsonify({
        "streak": streak,
        "total_hours": total_hours,
        "sessions_this_week": sessions_this_week,
        "by_subject": by_subject,
        "by_weekday": weekdays
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)