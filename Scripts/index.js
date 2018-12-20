/// <reference path="jquery-1.6.1-vsdoc.js" />
/// <reference path="Modelo/diagrama.js" />
/// <reference path="Modelo/estado.js" />
/// <reference path="Modelo/transicao.js" />
/// <reference path="Controle/teclaControle.js" />
/// <reference path="Controle/transicaoControle.js" />
/// <reference path="Controle/diagramaControle.js" />
/// <reference path="Controle/estadoControle.js" />
/// <reference path="raphael.js" />
/// <reference path="raphael.plugins.js" />
/// <reference path="Controle/mapaTransicaoControle.js" />
/// <reference path="Controle/sinteseControle.js" />

var o = {
    comando: null
};

$(function () {

    //$('#titulo').hoverwords({ delay: 50 }).mouseover().mouseout();

    diagramaPrincipal = new Diagrama('diagramo', '100%', '100%');
    var diagrama = diagramaPrincipal;
    $(diagramaPrincipal.paper.canvas).mouseup(diagrama, diagrama_up)
                                         .mousedown(diagrama, diagrama_down)
                                         .dblclick(diagrama, diagrama_duplo)
                                         .click(diagrama, diagrama_clicked);
    diagrama.config = o;
    diagrama.tabelaAssociacao = $('#tabelaAssociacao');
    diagrama.tabelaMapaTransicao = $('#mapaTransicao');
    diagrama.tabelaTransicao = $('#tabelaTransicao');
    diagrama.tabelaExcitacao = $('#tabelaExcitacao');
    diagrama.tabelaSintese = $('#tabelaSintese');


    diagrama.editor = $('#editor').hide();

    diagrama.editor.click(function () { return false; });
    //$(diagrama.paper.canvas).css('border', '1px solid').resizable();

    $('#propriedadesTela').dialog({
        autoOpen: false,
        modal: true,
        buttons: {
            'Confirmar': function () {
                var entradaProp = parseInt($('#entradaProp').removeClass('ui-state-error').val());
                var saidaMealyProp = parseInt($('#saidaMealyProp').removeClass('ui-state-error').val());
                var saidaMooreProp = parseInt($('#saidaMooreProp').removeClass('ui-state-error').val());

                var ok = true;
                var salvar = false;

                if (saidaMooreProp || (saidaMooreProp === 0 && saidaMealyProp !== 0)) { if (diagramaPrincipal.saidaMoore != saidaMooreProp) { diagrama_mudar_saidaMoore(diagramaPrincipal, saidaMooreProp); salvar = true; } }
                else $('#saidaMooreProp').addClass('ui-state-error') && (ok = false);
                if (saidaMealyProp || (saidaMealyProp === 0 && saidaMooreProp !== 0)) { if (diagramaPrincipal.saidaMealy != saidaMealyProp) { diagrama_mudar_saidaMealy(diagramaPrincipal, saidaMealyProp); salvar = true; } }
                else $('#saidaMealyProp').addClass('ui-state-error') && (ok = false);
                if (entradaProp) { if (diagramaPrincipal.entradas != entradaProp) { diagrama_mudar_Entrada(diagramaPrincipal, entradaProp); salvar = true; } }
                else $('#entradaProp').addClass('ui-state-error') && (ok = false);

                if (ok)
                    $(this).dialog('close');
                if (ok && salvar)
                    diagramaPrincipal.timeline.Salvar('propriedades_mudou');
            },
            'Cancelar': function () {
                $('#entradaProp').removeClass('ui-state-error');
                $('#saidaMealyProp').removeClass('ui-state-error');
                $('#saidaMooreProp').removeClass('ui-state-error');
                $(this).dialog('close');
            }
        }
    });
    $('#voltar').button({
        icons: {
            primary: "ui-icon-arrowreturnthick-1-w"
        },
        text: false
    });
    $('#avancar').button({
        icons: {
            primary: "ui-icon-arrowreturnthick-1-e"
        },
        text: false
    });
    $('#menu span').button();
    $('#menu, #associacaoEstados, #tabelaExcitacaoTab, #sinteseTab, #menuControl').buttonset();
    $('input:radio', '#associacaoEstados').click(diagrama, function (e) {
        //Tipo de codificação dos estados
        //Binário, Gray ou One-Hot
        var diagrama = e.data;
        diagrama.MudarCodificacao($(this).attr('id'));
    });
    $('input:radio', '#tabelaExcitacaoTab').click(diagrama, function (e) {
        var diagrama = e.data;
        diagrama.MudarFlipFlop($(this).val());
    });


    $('#binario', '#associacaoEstados').click();
    $('#flipflopD', '#tabelaExcitacaoTab').click();
    $('#expresso', '#sinteseTab').click();
    $('#comandos span').button();
    $('#comandos').buttonsetv(83);
    $(' > span', '#comandos').click(function () {
        o.comando = $(this).attr('id');

        $(this).addClass('ui-state-highlight');
        $(this).siblings().removeClass('ui-state-highlight');

        $(diagramaPrincipal.paper.canvas).css('cursor', 'default');

        if (o.comando == 'selecionar') {
            $('circle').css('cursor', 'move');
        } else if (o.comando == 'transicao') {
            $('circle').css('cursor', 'pointer');
        } else if (o.comando == 'arrastar') {
            $(diagramaPrincipal.paper.canvas).css('cursor', 'move');
            $('circle').css('cursor', 'move');
        } else {
            if (diagramaPrincipal.selecionados.length) diagramaPrincipal.DeselecionarTodos();
            $('circle').css('cursor', 'auto');
        }

        if (o.comando == 'animacao') {
            //$('#simulacao').siblings().stop(true, true)[efeitoSumir](tempoOut[0], tempoOut[1], tempoOut[2]).end()[efeitoAparecer](tempoIn[0], tempoIn[1], tempoIn[2]);
            $('#simulacao').showOnlyThis();
            diagramaPrincipal.Simula(0);
        } else {
            $('#simulacao').hide(100);
            diagramaPrincipal.Simula('cancela');
            //            if (diagramaPrincipal.estadoAtual) {
            //                diagramaPrincipal.estadoAtual.Desimula();
            //                diagramaPrincipal.estadoAtual = false;
            //                diagramaPrincipal.estadoInicial.Move(0, 0);
            //            }
        }
    });
    $('#diagramo').resizable();
    $('#tabs').tabs({
        fx: { opacity: 'toggle', duration: 300 },
        select: function (event, ui) {
            /*if (ui.panel.id == "associacaoEstados") {
            diagramaPrincipal.RecodificaTodos();
            }*/

            if (ui.panel.id == "mapaTransicaoTab") {
                tabelaTransicoes(diagramaPrincipal, diagramaPrincipal.tabelaMapaTransicao, false, false, false);
            }
            if (ui.panel.id == "tabelaTransicaoTab") {
                tabelaTransicoes(diagramaPrincipal, diagramaPrincipal.tabelaTransicao, false, false, true);
            }
            if (ui.panel.id == "tabelaExcitacaoTab") {
                montaTabelaExcitacao(diagramaPrincipal);
            }
            if (ui.panel.id == "sinteseTab") {
                Sintese(diagramaPrincipal);
            }
            ExportarShow(false);
            ImportarShow(false);
        }
    });
    $(':button', '#opcao').button();
    $('.paginas').hover(function (e) {
        if ($(this).hasClass('ui-state-disabled')) return;
        else $(this).addClass('ui-state-hover');
    }, function (e) {
        $(this).removeClass('ui-state-hover');
    });
    $('#opcao').children().hide();


    $('#exportarDiv').hide().find('button').button();
    $('#importarDiv').hide().find('button, #importarSpan').button();

    if ($.browser.msie) {
        $('#importarSpan, #exportarImagem, #exportarArquivo').remove();
    } else {
        $('#importarArquivo').css('opacity', '0');
        $('#importarArquivo').change(function (e) {
            var arquivo = e.target.files[0];
            ImportarArquivo(arquivo);
        });
    }

    //Zoom Slider
    $("#zoom").slider({
        range: "min",
        value: 1,
        min: 0.3,
        max: 5,
        step: 0.01,
        slide: function (event, ui) {
            //$("#zoomValor").text("Zoom: " + ui.value.toFixed(2));
            $("#zoomValor").val(ui.value * 100 + '%');
            diagramaPrincipal.Zoom(parseFloat(ui.value));
        },
        start: function (event, ui) {
            if(exibirLog4213) console.log(parseFloat(ui.value));
            $('#zoom').data('zoom', parseFloat(ui.value));
        },
        stop: function (event, ui) {
            if(exibirLog4213) console.log(parseFloat(ui.value));
            if ($('#zoom').data('zoom') != parseFloat(ui.value)) diagramaPrincipal.timeline.Salvar('zoom_mudou');
        }
    });
    $("#zoomValor").val($("#zoom").slider("value") * 100 + '%').keyup(function (e) {
        if (e.which == 13)
            $(this).blur();

        return false;
    }).blur(function () {
        if (parseFloat($(this).val())) {
            var valor = parseFloat($(this).val()) / 100;
            if (valor < 0.3 || valor > 5) {
                valor = valor < 0.3 ? 0.3 : 5;
            }

            $('#zoom').slider('value', valor);
            diagramaPrincipal.Zoom(parseFloat(valor));

            $(this).val(valor * 100 + '%');
        } else {
            $("#zoomValor").val($("#zoom").slider("value") * 100 + '%');
        }
    });

    diagrama.selecionados.push = function (elemento) {
        if (elemento)
            this[this.length++] = elemento;
        //diagrama_selecionados_mudou(diagrama);
        return this;
    };

    diagrama_mudar_saidaMoore(diagrama, 3);
    diagrama_mudar_saidaMealy(diagrama, 2);
    diagrama_mudar_Entrada(diagrama, 3);

    $('#selecionar').click();

    $('body').animate({ opacity: 1 }, 1000);

    //    $(window).bind("beforeunload", function () {
    //        if (localStorage) {
    //            localStorage['oragencad'] = JSON.stringify(diagramaPrincipal.Exportar());
    //        }
    //    });
});

function PossibilidadesEntrada(numeroBits, pagina, codificacao, qtdPorPagina) {
    //Exibir 10 possibilidades por página
    if (!this.qPP) this.qPP = 10;
    if(exibirLog4213) console.log(codificacao);
    var qPP = qtdPorPagina ? qtdPorPagina : this.qPP;

    var possibilidades = [];

    if (!codificacao) {
        for (var i = qPP * pagina; i < qPP * pagina + qPP; i++) {
            var poss = i.toString(2).pad(numeroBits);
            if (poss.length > numeroBits && possibilidades.length == 0) return false;
            else if (poss.length > numeroBits) return possibilidades;
            possibilidades.push(poss.toString());
        }
    } else {
        var i = 0;
        while (true) {
            switch (codificacao) {
                case 'binario':
                case 'Binário':
                    var poss = i.toString(2).pad(numeroBits);
                    if (poss.length > numeroBits && possibilidades.length == 0) return false;
                    else if (poss.length > numeroBits) return possibilidades;
                    possibilidades.push(poss.toString());
                    break;
                case 'gray':
                case 'Gray':
                    var poss = (i ^ (i >> 1)).toString(2).pad(numeroBits);
                    if (poss.length > numeroBits && possibilidades.length == 0) return false;
                    else if (poss.length > numeroBits) return possibilidades;
                    possibilidades.push(poss.toString());
                    break;
                case 'One-hot':
                case 'onehot':
                    if (i == numeroBits) return possibilidades.reverse();
                    var poss = [].AlterarTamanho(numeroBits, '0');
                    poss[i] = '1';
                    possibilidades.push(poss.join(''));
                    break;
                default:
                    return false;
            }

            i++;
        }
    }
    return possibilidades;

}