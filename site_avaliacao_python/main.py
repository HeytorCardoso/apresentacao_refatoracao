import os
from flask import Flask, render_template, request, jsonify
from database import db
from models import avaliacoes
from sqlalchemy import func

app = Flask(__name__)
app.secret_key = "minha_chave_super_secreta"
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)

@app.route("/", methods=["GET"])
def index():
    return render_template("index.html")

@app.route("/avaliacao", methods=["POST"])
def avaliacao():
    try:
        nome = request.form.get("nome")
        nota = request.form.get("nota")
        comentario = request.form.get("comentario")

        if not nome or not nota:
            return jsonify({"status": "error", "message": "Nome e avaliação são obrigatórios."}), 400

        nova_avaliacao = avaliacoes(nome=nome, nota=int(nota), comentario=comentario)
        db.session.add(nova_avaliacao)
        db.session.commit()
        return jsonify({"status": "success", "message": "Avaliação enviada com sucesso!"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/admin")
def admin():
    return render_template("admin.html")

@app.route("/api/status")
def api_status():
    avaliacoes_total = avaliacoes.query.count()
    media_nota = db.session.query(func.avg(avaliacoes.nota)).scalar() or 0
    
    distribuicao = db.session.query(avaliacoes.nota, func.count(avaliacoes.id)).group_by(avaliacoes.nota).all()
    dist_dict = {i: 0 for i in range(1, 6)}
    for r, count in distribuicao:
        dist_dict[r] = count

    recent = avaliacoes.query.order_by(avaliacoes.horario.desc()).limit(10).all()
    
    return jsonify({
        "total": avaliacoes_total,
        "media": round(media_nota, 1),
        "distribuicao": dist_dict,
        "recente": [e.to_dict() for e in recent]
    })

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(host="0.0.0.0", port=5000, debug=True)
