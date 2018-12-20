/// <reference path="transicaoControle.js" />
/// <reference path="teclaControle.js" />
/// <reference path="diagramaControle.js" />
/// <reference path="estadoControle.js" />
/// <reference path="mapaTransicaoControle.js" />
/// <reference path="opcaoControle.js" />
/// <reference path="sinteseControle.js" />
/// <reference path="tabelaExcitacaoControle.js" />
/// <reference path="../Modelo/transicao.js" />
/// <reference path="../Modelo/menu.js" />
/// <reference path="../Modelo/diagrama.js" />
/// <reference path="../Modelo/estado.js" />
/// <reference path="../jquery-1.6.2-vsdoc.js" />
/// <reference path="../raphael.plugins.js" />
/// <reference path="../json2.js" />

$(function () {

    $('span', '#simulacaoDiv').button();
    $('span', '#entradaSimulacaoDiv').button();
    $('#opcoesSimulacao').buttonset();

    $('#resumoCheck').click();

    //    $('#comecarSimulacao').click(function (e) {
    //        diagramaPrincipal.simulacaoInterval = setInterval('diagramaPrincipal.Simula(1)', 1500);
    //    });

    //    $('#pausarSimulacao').click(function (e) {
    //        clearInterval(diagramaPrincipal.simulacaoInterval);
    //    });

    $('#proximoSimulacao').click(function (e) {
        diagramaPrincipal.Simula(1);
    });

    //    $('#anteriorSimulacao').click(function (e) {
    //        diagramaPrincipal.Simula(-1);
    //    });

    $('#comecarSimulacao').click(function (e) {
        diagramaPrincipal.Simula('play');
    });

    $('#pausarSimulacao').click(function (e) {
        diagramaPrincipal.Simula('pause');
    });

    $('#reiniciarSimulacao').click(function (e) {
        diagramaPrincipal.Simula('reiniciar');
        diagramaPrincipal.Simula(0);
    });

    $('#entradaSimulacao').keyup(function (e) {
        var t = $(this).val().match(/[0-1\.,\- \n]/g);
        while (t != null && t[0] && t[0].match(/^[0-1]/) == null) t.remove(0);
        $(this).val(t != null ? t.join('') : '');
    }).blur(function (e) {
        var t = $(this).val().match(/[0-1]+|[\.,\- \n]+/g);
        var entrada = true;
        if (t != null && t.length) {
            for (var i = t.length - 1; i >= 0; i--) {
                if (entrada && (t[i].match(/[0-1]+/) == null || t[i].length != diagramaPrincipal.entradas)) {
                    t.remove(i);
                    if (i == 0 && t.length) i++;
                    continue;
                }
                if (!entrada && t[i].length > 1) {
                    t[i] = t[i][0];
                }
                if (!entrada && i == 0) t.remove(i);
                entrada = !entrada;
            }
            $(this).val(t.join(''));
        }
    });

    $('#opcoesSimulacao').click(function (e) {
        if ($('#resumoCheck').is(':checked')) {
            $('#resumoArea').show();
        } else {
            $('#resumoArea').hide();
        }
    });

    $('#binarioSimulacao, #graySimulacao, #onehotSimulacao').click(function (e) {
        $('#entradaSimulacao').val(PossibilidadesEntrada(diagramaPrincipal.entradas,0,$(this).text()).join(' '));
    });
});

var Anima = function () {
    if(exibirLog4213) console.log('Animando..');
    if (diagramaPrincipal.Simula(1, 'play'))
        diagramaPrincipal.simulacaoInterval = setTimeout(arguments.callee, 1500);
}

var Simulacao = function (diagrama, passo, origem) {
    if (!this.quadro) this.quadro = 0;
    if (!this.sMo) this.sMo = [];
    if (!this.sMe) this.sMe = [];
    if (passo === false || typeof passo == 'undefined' || passo == 'cancela' || passo == 'reiniciar') {
        clearTimeout(diagrama.simulacaoInterval);
        diagrama.EstadoAtual(false);
        if (diagrama.estadoInicial)
            diagrama.estadoInicial.Move(0, 0);
        this.quadro = 0;
        this.sMo = [];
        this.sMe = [];
        $('#entradaAtual').parent().find('span').text('---');
        //$('#saidaMooreSimulacao, #saidaMealySimulacao').val('');
        //$('#resumoSimulacao').text('');
        $('.simulacao_linha', '#resumo').remove();
        //$('#entradaSimulacao, #loopSimulacao').attr('disabled', false);
        HabilitarControles(true);
        return false;
    }

    if (!diagrama.estadoInicial) {
        $('#simulacaoMsg').text('Estado inicial não definido. Não é possível iniciar simulação.').addClass('ui-state-error');
        return false;
    } else {
        $('#simulacaoMsg').text('').removeClass('ui-state-error');
    }

    var entrada = EntradaAtual(diagrama, this.quadro);
    if (entrada) {
        if (passo == 'play') {
            Anima();
            $('#proximoSimulacao').button('option', 'disabled', true);
            return true;
        }
        if (passo == 'pause') {
            clearTimeout(diagrama.simulacaoInterval);
            $('#proximoSimulacao').button('option', 'disabled', false);
            $('#comecarSimulacao').button('option', 'disabled', false);
            return false;
        }
    }
    //if (EntradaAtual(diagrama, this.quadro)) {
    if (diagrama.estadoInicial && !diagrama.estadoAtual) {
        diagrama.EstadoAtual(diagrama.estadoInicial);
        this.quadro = 0;
        this.sMo.push(diagrama.EstadoAtual().saida.join(''));
    } else { //já existe um estado atual, verifica o próximo.
        if (passo == 1) {
            if (entrada) {
                $('#entradaAtual').text(entrada);
                var atual = diagrama.EstadoAtual();
                var proximo = atual.ProximoEstado(entrada, 'transicao');
                if (proximo == '-') {
                    this.quadro++;
                    HabilitarControles(false, origem);
                    //return;
                } else if (proximo != 'Indefinido') {
                    var sair = false;
                    for (var i = 0; i < atual.transicoes.length; i++) {
                        if (atual.transicoes[i].de == atual && atual.transicoes[i].para == proximo) {
                            for (var j = 0; j < atual.transicoes[i].Entrada().length; j++) {
                                var e = atual.transicoes[i].Entrada()[j];
                                var contador = 0;
                                for (var k = 0; k < e.length; k++) {
                                    contador += e[k] == entrada[k] || e[k] == 'X' ? 1 : 0;
                                }
                                if (contador == e.length) {
                                    this.sMe.push(atual.transicoes[i].Saida()[j].join(''));
                                    sair = true;
                                    break;
                                }
                            }
                        }
                        if (sair) break;
                    }
                    diagrama.EstadoAtual(proximo);
                    this.sMo.push(diagrama.EstadoAtual().saida.join(''));
                    this.quadro++;
                    HabilitarControles(false, origem);
                } else {
                    $('#simulacaoMsg').text('Não é possivel definir o próximo estado pois existe mais de uma possibilidade de transição.').addClass('ui-state-error');
                    return false;
                }
            } else {
                return false;
            }
        }
        //        if (passo == -1 && this.quadro) {
        //            var entrada = EntradaAtual(diagrama, this.quadro - 1);
        //            if (entrada) {
        //                var anterior = diagrama.EstadoAtual().EstadoAnterior(entrada, 'transicao');
        //                if (anterior == '-') {
        //                    this.quadro--;
        //                    //return;
        //                } else if (anterior != 'Indefinido') {
        //                    diagrama.EstadoAtual(anterior, true);
        //                    this.quadro--;
        //                } else {
        //                    $('#simulacaoMsg').text('Não é possivel definir o estado anterior pois existe mais de uma possibilidade de transição.').addClass('ui-state-error');
        //                    return;
        //                }
        //            }
        //        }
    }

    if($('.simulacao_linha','#resumo').length-1 != this.quadro)
        $('#resumo').append('<tr class="simulacao_linha"><td>' +
                            this.quadro + '</td><td>' +
                            (entrada && this.quadro != 0 ? entrada : '---') + '</td><td>' +
                            diagrama.EstadoAtual().id + '</td><td>' +
                            diagrama.EstadoAtual().saida.join('') + '</td><td>' +
                            (this.sMe[this.sMe.length - 1] ? this.sMe[this.sMe.length - 1] : '---') + '</td></tr>');

    $('#quadroSimulacao').text(this.quadro + 1);
    $('#proximaEntradaSimulacao').text(EntradaAtual(diagrama, this.quadro) ? EntradaAtual(diagrama, this.quadro) : '---');

    $('#saidaMooreAtual').text(diagrama.EstadoAtual().saida.join(''));
    $('#saidaMooreSimulacao').val(this.sMo.join("\n"));

    $('#saidaMealyAtual').text(this.sMe[this.sMe.length - 1]);
    $('#saidaMealySimulacao').val(this.sMe.join("\n"));

    $('#estadoAtual').text(diagrama.EstadoAtual().id);
    if (EntradaAtual(diagrama, this.quadro)) {
        $('#proximoEstado').text(diagrama.EstadoAtual().ProximoEstado(EntradaAtual(diagrama, this.quadro)));
    } else {
        $('#proximoEstado').text('---');
    }
    $('#resumoSimulacao').html($('#resumoSimulacao').html() + (entrada ? entrada : '---') + ' ' + (this.sMo[this.sMo.length - 1] ? this.sMo[this.sMo.length - 1] : '---') + '-' + (this.sMe[this.sMe.length - 1] ? this.sMe[this.sMe.length - 1] : '---') + '<br/>');

    return true;
}

var HabilitarControles = function (habilitar, origem) {
    if (habilitar) {
        $('#entradaSimulacao').attr('disabled', false);
        $('#loopSimulacao, #comecarSimulacao, #proximoSimulacao, #pausarSimulacao').button('option', 'disabled', false);
        $('span', '#entradaSimulacaoDiv').button('option', 'disabled', false);
    }
    else {
        $('#entradaSimulacao').attr('disabled', 'disabled');
        $('#loopSimulacao').button('option', 'disabled', true);
        if (origem && origem == 'play') $('#comecarSimulacao').button('option', 'disabled', true);
        else $('#comecarSimulacao').button('option', 'disabled', false);
        $('span', '#entradaSimulacaoDiv').button('option', 'disabled', true);
    }
}

var EntradaAtual = function (diagrama, quadro) {
    var entradas = $('#entradaSimulacao').val().split(/[^0-9]/);
    var is = [];
    var invalidas = [];

    for (var i = 0; i < entradas.length; i++) {
        if (entradas[i].length != diagrama.entradas) {
            invalidas.push(entradas[i]);
            is.push(i);
        }
    }
    if (invalidas.length) {
        $('#simulacaoMsg').text('A(s) entrada(s) ' + invalidas.join(', ') + ' serão ignoradas pois são inválidas.').addClass('ui-state-error');
    }

    for (var i = is.length - 1; i >= 0; i--) {
        entradas.remove(is[i]);
    }

    if (!entradas.length) {
        $('#simulacaoMsg').text('Favor informar as entradas.').addClass('ui-state-error');
        return false;
    }

    if (quadro >= entradas.length) {
        if ($('#loopSimulacao').is(':checked')) quadro = quadro % entradas.length;
        else {
            $('#simulacaoMsg').text('Fim simulação.').addClass('ui-state-error');
            $('#pausarSimulacao').button('option', 'disabled', true);
            return false;
        }
    }

    return entradas[quadro];
}