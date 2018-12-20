/// <reference path="estadoControle.js" />
/// <reference path="transicaoControle.js" />
/// <reference path="diagramaControle.js" />
/// <reference path="teclaControle.js" />
/// <reference path="../Modelo/transicao.js" />
/// <reference path="../Modelo/menu.js" />
/// <reference path="../Modelo/diagrama.js" />
/// <reference path="../Modelo/estado.js" />
/// <reference path="../jquery-1.6.1-vsdoc.js" />
/// <reference path="../jquery-ui-1.8.13.js" />
/// <reference path="../raphael.js" />
/// <reference path="../raphael.plugins.js" />
/// <reference path="../jQuery.DataLink.js" />

var impedirBolha = function (e) {
    //e.preventDefault();
    e.stopImmediatePropagation();
}

$(function () {
    //contexto dos eventos
    var $opcao = $('#opcao');
    var $entrada = $('#entradaTransicao', $opcao);
    var $saidaMoore = $('#saidaMoore', $opcao);
    var $saidaMealy = $('#saidaMealy', $opcao);
    //    var $entrada = '#entradaTransicao';
    //    var $saidaMoore = '#saidaMoore';
    //    var $saidaMealy = '#saidaMealy';
    var diagrama = diagramaPrincipal;

    $opcao.click(impedirBolha)
    .mouseup(impedirBolha)
    .mousedown(impedirBolha)
    .dblclick(impedirBolha)
    .keypress(impedirBolha)
    .keyup(impedirBolha)
    .keydown(impedirBolha);

    $('#idEstado', $opcao).keyup(function (e) {
        if ($(this).val() == '') return;

        var estado = diagrama.selecionados[0];

        estado.EstadoId($(this).val());
        $('#estadoId', $opcao).text($(this).val());
    }).focus(function (e) {
        $(this).data('val', $(this).val());
    }).blur(function (e) {
        if ($(this).data('val') != $(this).val()) {
            diagramaPrincipal.timeline.Salvar('estado_id_mudou');
            $(this).data('val', $(this).val());
        }
    });



    //$('#saidaMoore button').live('click', function () { if(exibirLog4213) console.log('chegou aqui'); });

    /*$($saidaMoore).click(function (e) {
    if ($(e.target).is(':checkbox')) {
    var estado = diagrama.selecionados[0];
    var posicao = $(e.target).val();
    var valor = $(e.target).button('option', 'label');

    $(e.target).attr('checked', true);

    estado.Saida(posicao, valor);
    }
    });

    $($entrada).click(function (e) {
    if ($(e.target).is(':checkbox')) {
    var transicao = diagrama.selecionados[0];
    var posicao = $(e.target).val();
    var valor = $(e.target).button('option', 'label');

    $(e.target).attr('checked', true);

    transicao.Entrada(posicao, valor);
    }
    });

    $($saidaMealy).click(function (e) {
    if ($(e.target).is(':checkbox')) {
    var transicao = diagrama.selecionados[0];
    var posicao = $(e.target).val();
    var valor = $(e.target).button('option', 'label');

    $(e.target).attr('checked', true);

    transicao.Saida(posicao, valor);
    }
    });*/

    $('#deletarEstado, #deletarTransicao, #deletarElementos', $opcao).click(diagrama, function (e) {
        var diagrama = e.data;
        diagrama.RemoverEstado(diagramaPrincipal.selecionados);
    });

    $('#estadoInicial', $opcao).click(diagrama, function (e) {
        diagrama.selecionados[0].EstadoInicial();
        diagrama.timeline.Salvar('estadoInicial');
    });

    $('#adicionarEntradaSaida', $opcao).click([$entrada, $saidaMealy, diagrama], function (e) {
        var $entrada = e.data[0];
        var $saidaMealy = e.data[1];
        var diagrama = e.data[2];
        var transicao = diagrama.selecionados[0];
        AdicionarEntradaM(diagrama, transicao, $entrada, $saidaMealy);
        /*transicao.Saida(transicao.Saida().length + 1, transicao.Saida()[0].length);
        transicao.Entrada(transicao.Entrada().length + 1, transicao.Entrada()[0].length);
        MontarBitsLinhas(diagrama, transicao, $entrada, $saidaMealy);*/

        //        var $divEntrada = $('#linhaEntrada' + transicao.entradas.length);
        //        if ($divEntrada.length) {
        //            $divEntrada.show();
        //            transicao.Entrada(transicao.Entrada().length + 1, transicao.Entrada()[0].length);
        //            MontarBits(diagrama, $divEntrada, transicao, true, transicao.entradas.length - 1);
        //        } else {
        //            $divEntrada = $('<div id="linhaEntrada' + transicao.entradas.length + '"></div>').appendTo($entrada);
        //            transicao.Entrada(transicao.Entrada().length + 1, transicao.Entrada()[0].length);
        //            MontarBits(diagrama, $divEntrada, transicao.entradas[0].length, true, transicao.entradas.length - 1);
        //        }

        //        var $divSaida = $('linhaSaida' + transicao.saidas.length);
        //        if ($divSaida.length) {
        //            $divSaida.show();
        //            transicao.Saida(transicao.Saida().length + 1, transicao.Saida()[0].length);
        //            MontarBits(diagrama, $divSaida, transicao, false, transicao.saidas.length - 1);
        //        } else {
        //            $divSaida = $('<div id="linhaSaida' + transicao.saidas.length + '"></div>').appendTo($saidaMealy);
        //            transicao.Saida(transicao.Saida().length + 1, transicao.Saida()[0].length);
        //            MontarBits(diagrama, $divSaida, transicao.saidas[0].length, false, transicao.saidas.length - 1);

        //            if ($('#delBit' + (transicao.saidas.length - 1)).length)
        //                $('#delBit' + (transicao.saidas.length - 1)).appendTo($divSaida);
        //            else
        //                $('<span id="delBit' + (transicao.saidas.length - 1) + '">Excluir</span>').appendTo($divSaida).button().click(function () { if(exibirLog4213) console.log($(this).attr('id')); });
        //        }

        //transicao.Entrada(transicao.Entrada().length + 1, transicao.Entrada()[0].length).Saida(transicao.Saida().length + 1, transicao.Saida()[0].length);
    });
});

var AdicionarEntradaM = function (diagrama, transicao, $entrada, $saidaMealy) {
    transicao.Saida(transicao.Saida().length + 1, transicao.Saida()[0].length);
    transicao.Entrada(transicao.Entrada().length + 1, transicao.Entrada()[0].length);
    MontarBitsLinhas(diagrama, transicao, $entrada, $saidaMealy);
};