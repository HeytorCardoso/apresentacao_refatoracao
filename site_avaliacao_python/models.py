from database import db
from datetime import datetime

class avaliacoes(db.Model):
    __tablename__ = "avaliacoes"
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(256), nullable=False)
    nota = db.Column(db.Integer, nullable=False)
    comentario = db.Column(db.Text, nullable=True)
    horario = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "nome": self.nome,
            "nota": self.nota,
            "comentario": self.comentario,
            "horario": self.horario.strftime("%d/%m/%Y %H:%M")
        }
