const express = require('express');
const app = express();
const { check } = require('express-validator');

const {
  agendamento,
  listagem,
  cancelamento,
  atualizar,
} = require('./agendamento.db');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const regData =
  /^((202[3-9])|(20[3-9]\d)|([3-9]\d{3,}))-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;

const regexHora = /^(0[0-9]|1[0-9]|2[0-3])$/;
app.get('/', listagem);
app.post(
  '/',
  [
    check(
      'data',
      'Formato de data invalido: YYYY-MM-DD ou data anterior a 2023',
    ).matches(regData),
    check('hora', 'Formato de hora invalida: HH').matches(regexHora),
    check('paciente', 'Nome do paciente é necessario').notEmpty(),
    check('medico', 'Nome do medico é necessario').notEmpty(),
  ],
  agendamento,
);
app.delete('/:id', cancelamento);
app.put(
  '/:id',
  [
    check('id', 'Invalid ID format').isInt(),
    check(
      'data',
      'Formato de data invalido: YYYY-MM-DD ou data anterior a 2023',
    ).matches(regData),
    check('hora', 'Formato de hora invalida: HH').matches(regexHora),
  ],
  atualizar,
);

app.listen(5000, () => {
  console.log('http://localhost:5000');
});
