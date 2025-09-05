from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import traceback
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Lataa kysymykset ja vastaukset JSON-tiedostosta
with open('kysymykset.json', 'r', encoding='utf-8') as f:
    qa_data = json.load(f)

# Vastauslogiikka
def get_response(user_input):
    user_input_lower = user_input.lower()
    suggestions = []

    for item in qa_data:
        question = item['Kysymys'].lower()
        keywords = [keyword.lower() for keyword in item.get('Avainsanat', [])]

        if user_input_lower in question:
            return item['Vastaus']
        elif any(word in question for word in user_input_lower.split()) or any(word in keywords for word in user_input_lower.split()):
            suggestions.append(item['Kysymys'])

    if suggestions:
        return f"En löytänyt tarkkaa vastausta. Ehkä nämä kysymykset voivat auttaa: {'; '.join(suggestions[:5])}"
    else:
        return "En löytänyt vastausta kysymykseesi. Ole yhteydessä palkkahallintoon."

# POST-pyyntö /ask-reitille
@app.route('/ask', methods=['POST'])
def ask():
    try:
        data = request.get_json(force=True)
        question = data.get('question', '').strip()

        if not question:
            return jsonify({'answer': 'Kysymystä ei saatu vastaanotettua.'}), 400

        # Tallenna kysymys lokitiedostoon aikaleiman kanssa
        try:
            with open('user_questions.log', 'a', encoding='utf-8') as log_file:
                timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                log_file.write(f"[{timestamp}] {question}\n")
        except Exception as log_error:
            print("Lokitiedoston kirjoitusvirhe:", log_error)

        answer = get_response(question)
        return jsonify({'answer': answer})

    except Exception as e:
        print("Virhe käsiteltäessä pyyntöä:", e)
        traceback.print_exc()
        return jsonify({'answer': 'Palvelimella tapahtui virhe.'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
