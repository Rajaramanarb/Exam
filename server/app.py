from flask import Flask, request, jsonify
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import BernoulliNB

app = Flask(__name__)

# Load the trained model
cv = CountVectorizer()
nb1 = BernoulliNB()
nb1.fit(X_train, y_train)  # Assuming X_train and y_train are already defined from your model training

@app.route('/predict', methods=['POST'])
def predict():
    # Get the comment from the request
    comment = request.json.get('comment')

    # Vectorize the comment using the same CountVectorizer
    comment_vector = cv.transform([comment])

    # Make prediction using the trained model
    prediction = nb1.predict(comment_vector)[0]

    # Return the prediction as JSON response
    return jsonify({'prediction': prediction})

if __name__ == '__main__':
    app.run(debug=True)