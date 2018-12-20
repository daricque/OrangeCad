var montaTabelaExcitacao = function (diagrama) {
    var $tabela = diagrama.tabelaExcitacao;
    var $linhas = $tabela.find('tr:not(:first)');
    var $linha, $colunas;
    var c = 0;
    var flipflop = diagrama.flipflop;
    var estado;
    var transicao;

    for (var i = 0; i < diagrama.estados.length; i++) {
        estado = diagrama.estados[i];
        for (var j = 0; j < estado.transicoes.length; j++) {
            transicao = estado.transicoes[j];
            if (transicao.de == estado) {
                for (var k = 0; k < transicao.entradas.length; k++) {
                    if ($linhas[c]) {
                        $linha = $linhas.eq(c++).show();
                    } else {
                        $linha = $('<tr><td></td><td></td><td></td><td></td></tr>').appendTo(diagrama.tabelaExcitacao);
                    }
                    $colunas = $linha.find('td');
                    $colunas.eq(0).text(estado.codificacao);
                    $colunas.eq(1).text(transicao.Entrada()[k].join(''));
                    $colunas.eq(2).text(Excitacao(transicao.de.codificacao, transicao.para.codificacao, flipflop));
                    $colunas.eq(3).text( (transicao.para.saida.length ? 'Moore: ' + transicao.para.saida.join('') : '') + (transicao.Saida()[k].length ? ' Mealy: ' + transicao.Saida()[k].join('') : ''));
                }
            }
        }
    }

    if(exibirLog4213) console.log('c = ' + c + ' e length = ' + $linhas.length);

    if (c < $linhas.length) {
        $linhas.filter(':gt(' + (c-1) + ')').hide();
    }
}

function Excitacao(de, para, flipflop) {
    var s = '';
    for (var i = 0; i < de.length; i++) {
        s += FlipFlop(flipflop, de[i] + para[i]);
    }
    return s;
}

function FlipFlop(tipo, mudanca) {
    switch (tipo) {
        case "D": switch (mudanca) {
                case "00": return "0";
                case "01": return "1";
                case "10": return "0";
                case "11": return "1";
            }
        case "T": switch (mudanca) {
                case "00": return "0";
                case "01": return "1";
                case "10": return "1";
                case "11": return "0";
            }
        case "RS": switch (mudanca) {
                case "00": return "X0";
                case "01": return "01";
                case "10": return "10";
                case "11": return "0X";
            }
        case "JK": switch (mudanca) {
                case "00": return "0X";
                case "01": return "1X";
                case "10": return "X1";
                case "11": return "X0";
            }
    }
}