const db = require('./db');
const { validationResult } = require('express-validator');

class Consulta {
  listagem(req, res) {
    db.all('SELECT * FROM agendamento', [], (erro, resultado) => {
      if (erro) {
        res.status(400).json({ error: erro.message });
      }
      res.json(resultado);
    });
  }

  agendamento(req, res) {
    const { data, hora, paciente, medico } = req.body;
    const day = new Date(data + 'T03:00:00');
    day.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    console.log(day, today);
    if (today > day) {
      return res
        .status(400)
        .json({ error: 'Não realizamos agendamento no passado.' });
    }

    const horas = parseInt(hora);
    const horas_agora = new Date().getHours();
    console.log(horas, horas_agora);
    if (horas <= horas_agora) {
      return res
        .status(400)
        .json({ error: 'Não realizamos agendamento no passado.' });
    }

    // Validar os dados de entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    // Verificar se a consulta já foi agendada
    db.get(
      'SELECT * FROM agendamento WHERE data = ? AND hora = ?',
      [data, hora],
      (erro, resultado) => {
        if (erro) {
          return res.status(400).json({ error: erro.message });
        }

        if (resultado) {
          return res.status(409).json({
            error: 'Já existe uma consulta agendada para esta data e hora.',
          });
        }
        db.run(
          'INSERT INTO agendamento (data, hora, paciente, medico, status) VALUES (?,?,?,?,?);',
          [data, hora, paciente, medico, 'marcado'],
          function (erro) {
            if (erro) {
              return res.status(500).json({ error: erro.message });
            }

            res
              .status(201)
              .json({ id: this.lastID, mensagem: 'Consulta agendada' });
          },
        );
      },
    );
    // Agendar a consulta
  }

  atualizar(req, res) {
    const id = req.params.id;
    const { data, hora } = req.body;
    const day = new Date(data + 'T03:00:00');
    day.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    console.log(day, today);
    if (today > day) {
      return res
        .status(400)
        .json({ error: 'Não realizamos agendamento no passado.' });
    }

    const horas = parseInt(hora);
    const horas_agora = new Date().getHours();
    console.log(horas, horas_agora);
    if (horas <= horas_agora) {
      return res
        .status(400)
        .json({ error: 'Não realizamos agendamento no passado.' });
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    db.get(
      'SELECT * FROM agendamento WHERE id = ?',
      [id],
      (erro, resultado) => {
        if (erro) {
          return res.status(500).json({ error: erro.message });
        }

        if (!resultado) {
          return res.status(404).json({ error: 'Consulta não encontrada' });
        }
        db.run(
          'UPDATE agendamento SET data = ?, hora = ? WHERE id = ?',
          [data, hora, id],
          (erro, resultado) => {
            if (erro) {
              res.status(500).json({ error: erro.message });
            }
            res.json({ message: 'Consulta atualizada com sucesso.' });
          },
        );
      },
    );
  }

  cancelamento(req, res) {
    const id = req.params.id;
    // Verificar se a consulta existe
    db.get(
      'SELECT * FROM agendamento WHERE id = ?',
      [id],
      (erro, resultado) => {
        if (erro) {
          return res.status(500).json({ error: erro.message });
        }

        if (!resultado) {
          return res.status(404).json({ error: 'Consulta não encontrada.' });
        }
        // Se a consulta existe, cancelar a consulta
        db.run(
          'UPDATE agendamento SET status = ? WHERE id = ?',
          ['cancelado', id],
          (erro, resultado) => {
            if (erro) {
              res.status(400).json({ error: erro.message });
            }
            res.json({ message: 'Consulta cancelada com sucesso.' });
          },
        );
      },
    );
  }
}

module.exports = new Consulta();
