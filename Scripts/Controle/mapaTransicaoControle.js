/// <reference path="estadoControle.js" />
/// <reference path="transicaoControle.js" />
/// <reference path="diagramaControle.js" />
/// <reference path="opcaoControle.js" />
/// <reference path="teclaControle.js" />
/// <reference path="../Modelo/transicao.js" />
/// <reference path="../Modelo/menu.js" />
/// <reference path="../Modelo/diagrama.js" />
/// <reference path="../Modelo/estado.js" />
/// <reference path="../jquery-ui-1.8.13.js" />
/// <reference path="../index.js" />
/// <reference path="../jquery-1.6.1-vsdoc.js" />
/// <reference path="../raphael.js" />
/// <reference path="../raphael.plugins.js" />

//var tabelaTransicoes = function (diagrama, $tabela, pagina, qtdPorPagina, codificacao) {
function tabelaTransicoes(diagrama, $tabela, pagina, qtdPorPagina, codificacao) {
    //(this.pagina);
    if (pagina || pagina === 0) this.pagina = pagina;
    if (!this.pagina && this.pagina !== 0) this.pagina = 0;
    //(this.qtdPagina);
    if (qtdPorPagina || qtdPorPagina === 0) this.qtdPorPagina = qtdPorPagina;
    if (!this.qtdPorPagina && this.qtdPorPagina !== 0) this.qtdPorPagina = 10;
    //caso codificao seja true, exibe a codificação em vez do nome.
    if (montaPossibilidades(diagrama, $tabela, this.pagina, this.qtdPorPagina) || ( ((this.pagina = 0) || true) && montaPossibilidades(diagrama, $tabela, 0, this.qtdPorPagina)) ) {
        for (var i = 0; i < diagrama.estados.length; i++) {
            estadoTransicoes(diagrama.estados[i], codificacao);
        }
        montaPaginacao(diagrama, $tabela, this.pagina, this.qtdPorPagina, diagrama.entradas, codificacao);
    }

    return this.pagina;
}

//var montaPossibilidades = function (diagrama, $tabela, pagina, qtdPorPagina) {
function montaPossibilidades(diagrama, $tabela, pagina, qtdPorPagina) {
    var possibilidades = PossibilidadesEntrada(diagrama.entradas, pagina);
    if (possibilidades !== false) {
        var $possibilidadesLinha = $tabela.find('tr:first');

        if ($possibilidadesLinha.find('td').length-1 < qtdPorPagina) {
            var c = $possibilidadesLinha.find('td').length-1;

            if (c == -1) $possibilidadesLinha.addClass("ui-widget-header");

            while (c++ < qtdPorPagina) $possibilidadesLinha.append('<td>');
            //while (c++ < qtdPorPagina) $('<td>').appendTo($possibilidadesLinha).addClass("ui-widget-header");
        }

        if ($possibilidadesLinha.find('td').length-1 > qtdPorPagina) {
            var c = $possibilidadesLinha.find('td').length-1;
            while (c-- > qtdPorPagina) $possibilidadesLinha.find('td:last').remove();
        }

        if ($possibilidadesLinha.find('td:first').text() == '') {
            var t = 'Estado\\Entrada';
            $possibilidadesLinha.find('td:first').html(t);
        }

        var $poss = $possibilidadesLinha.find('td:not(:first)').text('');


        for (var i = 0; i < $poss.length; i++) {
            $poss.eq(i).text(possibilidades[i]);
        }

        var size = 100 / ($poss.length + 1) + '%';

        $possibilidadesLinha.find('td').css('width', size);

        return true;
    }
    return false;
}

function montaPaginacao(diagrama, $tabela, pagina, qtdPorPagina, numeroBits, codificacao) {
    var qual = codificacao ? "tabela" : "mapa";

    //this.total;
    if (numeroBits) this.total = parseInt(Math.pow(2, numeroBits) / qtdPorPagina);

    var $begin = $('#' + qual + 'PaginaFirst');
    var $prev = $('#' + qual + 'PaginaPrev');
    var $page = $('#' + qual + 'Page');
    var $next = $('#' + qual + 'PaginaNext');
    var $end = $('#' + qual + 'PaginaEnd');
    var $qtdPagina = $('#' + qual + 'PaginaQtd');

    if (pagina == 0) {
        $begin.addClass('ui-state-disabled');
        $prev.addClass('ui-state-disabled');
        $begin.data('pagina', false);
        $prev.data('pagina', false);
    } else {
        $begin.removeClass('ui-state-disabled');
        $prev.removeClass('ui-state-disabled');
        $begin.data('pagina', 0);
        $prev.data('pagina', pagina-1);
    }

    if (pagina == this.total) {
        $end.addClass('ui-state-disabled');
        $next.addClass('ui-state-disabled');
        $end.data('pagina', false);
        $next.data('pagina', false);
    } else {
        $end.removeClass('ui-state-disabled');
        $next.removeClass('ui-state-disabled');
        $end.data('pagina', this.total);
        $next.data('pagina', pagina+1);
    }

    $page.val(pagina + 1);
    $qtdPagina.text('Página ' + (pagina + 1) + ' de ' + (this.total + 1));

    if ((!codificacao && !this.first) || (codificacao && !this.firstC)) {
        if (!codificacao)
            this.first = true;
        else
            this.firstC = true;
        $begin.click([diagrama, $tabela, codificacao], paginaClick);
        $prev.click([diagrama, $tabela, codificacao], paginaClick);
        $page.keyup([diagrama, $tabela, codificacao], function (e) {
            if (e.which == 13) {
                var diagrama = e.data[0];
                var $tabela = e.data[1];
                var codificacao = e.data[2];

                if ($(this).val().match(/^[1-9][0-9]*$/)) {
                    var pagina = parseInt($(this).val())-1;
                    tabelaTransicoes(diagrama, $tabela, pagina, qtdPorPagina, codificacao);
                } else {
                    $(this).addClass('ui-state-erro');
                }
            } else {
                $(this).removeClass('ui-state-error');
            }
        });
        $next.click([diagrama, $tabela, codificacao], paginaClick);
        $end.click([diagrama, $tabela, codificacao], paginaClick);
    }
}

var paginaClick = function (e) {
    var diagrama = e.data[0];
    var $tabela = e.data[1];
    var codificacao = e.data[2];
    var pagina = $(this).data('pagina');

    if(exibirLog4213) console.log(pagina);

    if (pagina || pagina === 0)
        tabelaTransicoes(diagrama, $tabela, pagina, qtdPorPagina, codificacao);
};

//var estadoTransicoes = function (estado, codificacao) {
function estadoTransicoes(estado, codificacao) {
    var $linha = codificacao ? estado.tabelaTransicao : estado.mapaTransicao;
    var $entradas = $linha.closest('table').find('tr:first td:not(:first)'); //.css('color', '#d00');
    var $colunas = $linha.find('td');
    //var qtdEntrada = estado.diagrama.entrada;s

    if ($colunas.length == 0) {
        if (codificacao)
            $('<td>').appendTo($linha).text(estado.codificacao).addClass('ui-widget-header');
        else
            $('<td>').appendTo($linha).text(estado.id).addClass('ui-widget-header');
    } else {
        if (codificacao)
            $linha.find('td:first').text(estado.codificacao);
        else
            $linha.find('td:first').text(estado.id);
    }

    $colunas = $linha.find('td');

    if ($colunas.length - 1 < $entradas.length) {
        var c = $colunas.length - 1;
        while (c++ < $entradas.length) $linha.append('<td>');
    }
    if ($colunas.length - 1 > $entradas.length) {
        var c = $colunas.length - 1;
        while (c-- > $entradas.length) $linha.find('td:last').remove();
    }

    //var $transicoes = $linha.find('td:not(:first)');

    $colunas = $linha.find('td:not(:first)');

    for (var i = 0; i < $entradas.length; i++) {
        if ($entradas.eq(i).text() != '') {
            $colunas.eq(i).text(estado.ProximoEstado($entradas.eq(i).text(), codificacao));
            if ($colunas.eq(i).text() == 'Indefinido') {
                $colunas.eq(i).addClass('ui-state-error');
            } else {
                $colunas.eq(i).removeClass('ui-state-error');
            }
        } else {
            $colunas.eq(i).text('');
        }
    }

}