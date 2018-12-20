/// <reference path="diagrama.js" />
/// <reference path="../Controle/diagramaControle.js" />
$(function () {
    $('body').bind('dragenter', function (e) {
        if (e.originalEvent.dataTransfer) {
            if (e.originalEvent.dataTransfer.dropEffect.match('copy') || e.originalEvent.dataTransfer.effectAllowed.match('copy')) {
                if ($('#importarDiv').is(':visible')) {
                    $('#importarArea').css('border', '3px dashed #69c');
                } else {
                    $('#importar').click();
                    $('#importarArea').css('border', '3px dashed #69c');
                }

                if(exibirLog4213) console.log(e.originalEvent.dataTransfer);
            }
        }
        return false;
    }).bind('dragover', function (e) {
        return false;
    }).bind('drop', function (e) {
        if (e.originalEvent.dataTransfer && e.originalEvent.dataTransfer.files && e.originalEvent.dataTransfer.files[0]) {
            $('#importarArea').css('border', '');

            //ImprimePropriedades(e.dataTransfer.files[0]);

            var arquivo = e.originalEvent.dataTransfer.files[0];

            ImportarArquivo(arquivo);

            setTimeout('$("#importar").click();', 300);
        }
        return false;
    });
    $('span', '#menu').click(function () {
        var $this = $(this);
        if ($this.attr('id') == "novo") {
            Novo();
            return;
        }
        if ($this.attr('id') == "propriedades") {
            Propriedades();
            return;
        }
        if ($this.attr('id') == "salvar") {
            Salvar();
            return;
        }
        if ($this.attr('id') == "deterministica") {
            TornarDeterministico();
            return;
        }
        if ($this.attr('id') == "exportar") {
            if ($('#exportarDiv').is(':visible')) {
                ExportarShow(false);
            } else {
                ExportarShow(true);
            }
            return;
        }
        if ($this.attr('id') == "importar") {
            if ($('#importarDiv').is(':visible')) {
                ImportarShow(false);
            } else {
                ImportarShow(true);
            }
            return;
        }
        if ($this.attr('id') == "imprimir") {
            Imprimir();
            return;
        }
    });
    $('span', '#menuControl').click(function () {
        var $this = $(this);
        if ($this.attr('id') == "voltar") {
            diagramaPrincipal.timeline.Voltar();
            return;
        }

        if ($this.attr('id') == "avancar") {
            diagramaPrincipal.timeline.Avancar();
            return;
        }
    });

    $('#exportarDiv, #importarDiv, #exportar, #importar').click(impedirBolha)
                                   .mouseup(impedirBolha)
                                   .mousedown(impedirBolha)
                                   .dblclick(impedirBolha)
                                   .keypress(impedirBolha)
                                   .keyup(impedirBolha)
                                   .keydown(impedirBolha);
});

var ExportarShow = function (exibir) {
    if (exibir) {
        $('#exportarArea').val(JSON.stringify(diagramaPrincipal.Exportar())).parent().slideDown(500).siblings('#importarDiv').slideUp(500);
        $('#exportar').addClass('ui-state-highlight');
        $('#importar').removeClass('ui-state-highlight');
        $('#exportarArea').select();
    } else {
        $('#exportarDiv').slideUp(500);
        $('#exportar').removeClass('ui-state-highlight');
    }
}

var ImportarShow = function (exibir) {
    if (exibir) {
        $('#importarArea').parent().slideDown(500).siblings('#exportarDiv').slideUp(500).end();
        $('#importar').addClass('ui-state-highlight');
        $('#exportar').removeClass('ui-state-highlight');
        $('#importarMsg').hide();
    } else {
        $('#importarDiv').slideUp(500);
        $('#importar').removeClass('ui-state-highlight');
    }
}

var Novo = function () {
    $('#tabs').tabs('select', 0);
    if (window.confirm("Tem certeza que deseja criar um novo diagrama? Todos os dados do diagrama atual serão perdidos.")) {
        diagramaPrincipal.LimparTudo(true);
    }
};

var Propriedades = function () {
    diagramaPrincipal.DeselecionarTodos();
    $('#saidaMooreProp').val(diagramaPrincipal.saidaMoore);
    $('#saidaMealyProp').val(diagramaPrincipal.saidaMealy);
    $('#entradaProp').val(diagramaPrincipal.entradas);
    $('#propriedadesTela').dialog('open');
}

var Salvar = function () {
    if (localStorage)
        alert('É possível salvar');
    else
        alert('Seu navegador não permite que salve');
}

var TornarDeterministico = function () {
    var diagrama = diagramaPrincipal;
    var estado, diagrama;
    var possibilidades = PossibilidadesEntrada(diagrama.entradas, 0, 'binario');
    var proprio, salvar = false;
    var $entrada = $('#entradaTransicao'), $saidaMealy = $('#saidaMealy');

    diagrama.timeline.Ativo(false);

    for (var i = 0; i < diagrama.estados.length; i++) {
        estado = diagrama.estados[i];
        proprio = null;
        if (estado.transicoes.length) {
            var p = possibilidades.slice();
            for (var j = 0; j < estado.transicoes.length && p.length; j++) {
                transicao = estado.transicoes[j];

                if (transicao.de != estado) continue;

                if (transicao.de == estado && transicao.para == estado) proprio = transicao;

                for (var l = 0; l < transicao.Entrada().length; l++) {
                    if (transicao.Entrada()[0].join('') == ([].AlterarTamanho(diagrama.entradas, 'X')).join('')) {
                        p = [];
                        break;
                    }
                }
                for (var k = p.length - 1; k >= 0; k--) {
                    if (transicao.VerificaEntrada(p[k]))
                        p.remove(k);
                }
            }

            if(exibirLog4213) console.log(estado.id);
            if(exibirLog4213) console.log(p.length + ' ' + possibilidades.length);

            if (p.length == possibilidades.length) {
                CriarTransicaoDePara(estado, estado);
                salvar = true;
                continue;
            }

            if (p.length) {
                for (var m = 0; m < p.length; m++) {
                    if (proprio == null) {
                        proprio = CriarTransicaoDePara(estado, estado);
                        //Alterar a entrada criada
                        for (var n = 0; n < p[m].length; n++) {
                            proprio.Entrada(0, n, p[m][n]);
                            salvar = true;
                        }
                    } else {
                        //Adiciona entradas
                        proprio.Saida(proprio.Saida().length + 1, proprio.Saida()[0].length);
                        proprio.Entrada(proprio.Entrada().length + 1, proprio.Entrada()[0].length);
//                        MontarBitsLinhas(diagrama, proprio, $entrada, $saidaMealy);
//                        AdicionarEntradaM(diagrama, proprio, $entrada, $saidaMealy);
                        for (var n = 0; n < p[m].length; n++) {
                            proprio.Entrada(proprio.Entrada().length - 1, n, p[m][n]);
                            salvar = true;
                        }
                    }
                }
            }
        } else {
            CriarTransicaoDePara(estado, estado);
            salvar = true;
        }
    }

    diagrama.timeline.Ativo(true);
    if (salvar) diagrama.timeline.Salvar('deterministica');

}

var Minimizar = function (vetor) {
    if (vetor.length <= 1) return vetor;
    else {
        var vb = vetor.slice();
        for (var i = 0; i < vetor.length; i++) {
            
        }
    }
}

var MinimizarBits = function (bits1, bits2) {
    var minimizado = [];
    if (bits1 == bits2) [bits1];
    else if (bits1 == ([].AlterarTamanho(bits1.length, 'X')).join('')) return [bits1];
    else if (bits2 == ([].AlterarTamanho(bits2.length, 'X')).join('')) return [bits2];
}

var ExportarImagem = function() {
    var a = window.open();
    var b = SVG.makeImgTag(diagramaPrincipal.paper.canvas);
    $('body',a.document).append(b);
}

var Exportar = function () {
    $('#exportarMsg').text('Exportando..').show();
    $('#exportarArea').val(JSON.stringify(diagramaPrincipal.Exportar())).select();
    $('#exportarMsg').text('Exportado com sucesso.').fadeOut(1000);
}

var Importar = function (importar) {
    try {
        var a = JSON.parse($('#importarArea').val());
        if (!importar) $('#importarMsg').removeClass('ui-state-error ui-corner-all').text('').show();
        if (!a.diagrama || !a.estados || !a.transicoes) throw new Exception();
    } catch (e) {
        $('#importarMsg').addClass('ui-state-error ui-corner-all').text('Erro ao importar. O texto passado não é válido.').show();
        return false;
    }

    if (importar) {
        $('#tabs').tabs('select', 'diagramaTab');

        ImportarCore(a);

        $('#importarMsg').text('Importando com sucesso.').fadeOut(1000);
        setTimeout('ImportarShow(false)', 1200);
        return a;
    } else {
        $('#importarMsg').text('Importando..');
        setTimeout('Importar(true);', 30);
    }
}

function ImportarCore(a) {
    //IMPORTAR DIAGRAMA

    var diagrama = diagramaPrincipal;

    diagrama.LimparTudo();
    diagrama_mudar_Entrada(diagrama, a.diagrama.entradas);
    diagrama_mudar_saidaMoore(diagrama, a.diagrama.saidaMoore);
    diagrama_mudar_saidaMealy(diagrama, a.diagrama.saidaMealy);
    //diagrama.MudarCodificacao(a.diagrama.codificacao);
    //diagrama.MudarFlipFlop(a.diagrama.flipflop);
    //diagrama.MudarTipoDescricao(a.diagrama.tipoDescricao);
    diagrama.Zoom(a.diagrama.zoom);

    $('#zoom').slider('value', a.diagrama.zoom);
    $("#zoomValor").val($("#zoom").slider("value") * 100 + '%');

    $('#' + a.diagrama.codificacao).click();
    $('#flipflop' + a.diagrama.flipflop).click();
    if (a.diagrama.tipoDescricao == 'VHDL') $('#vhdl').click();
    else $('#expresso').click();
    //FIM DIAGRAMA

    //IMPORTAR ESTADOS

    $.each(a.estados, function (uid, estado) {
        if (estado) {
            var e = CriarEstado(diagrama, estado.posX, estado.posY, diagrama.Size());
            e.id = estado.id;
            e.saida = estado.saida.clone();
            if (a.diagrama.estadoInicial === uid) e.EstadoInicial();
            e.Refresh();
            estado.estado = e;
            if (estado.selecionado) {
                diagrama.SelecionarEstado(e);
                e.Selecionar();
            }
        }
    });

    //FIM ESTADOS

    //IMPORTAR TRANSIÇÕES

    $.each(a.transicoes, function (uid, transicao) {
        if (transicao) {
            var c = CriarTransicaoDePara(a.estados[transicao.de].estado, a.estados[transicao.para].estado);
            c.entradas = transicao.entradas.clone();
            c.saidas = transicao.saidas.clone();
            c.Refresh();

            c.controls[0].attr({ cx: transicao.controls[0].x, cy: transicao.controls[0].y });
            c.controls[1].attr({ cx: transicao.controls[1].x, cy: transicao.controls[1].y });
            c.controls[2].attr({ cx: transicao.controls[2].x, cy: transicao.controls[2].y });
            c.texto.attr({ x: transicao.texto.x, y: transicao.texto.y });

            c.controls[0].update(0, 0);
            c.controls[1].update(0, 0);
            c.controls[2].update(0, 0);
            if (transicao.selecionado) {
                diagrama.SelecionarTransicao(c);
                c.SelecionarCurva();
            }
        }
    });

    $.each(a.estados, function (uid, estado) {
        estado.estado = null; //Evita Objeto Circular
        //a.estados[i].estado = null;
    });

    //FIM TRANSIÇÕES
}

var ImportarArquivo = function (arquivo) {
    var reader = new FileReader();

    reader.onloadend = function (e) {
        if (e.target.readyState == FileReader.DONE) {
            $('#importarArea').val(e.target.result);
            Importar();
        }
    };

    $('#importarArea').val(reader.readAsText(arquivo));
}

var Imprimir = function () {
    var aba = $('#tabs').tabs('option', 'selected');
    var $aba = $('#tabs div:visible:eq(1)');

    var janela = window.open('./print.htm');
    //$('head', janela.document).append('<link href="Content/themes/orangecad/jquery-ui-custom.css" rel="stylesheet" type="text/css" />');
    (function () {

        if ($('#printer', janela.document).length) {
            $('html,body', janela.document).css('background', '#fff').css('background-color', '#fff').css('color', '#000');
            switch (aba) {
                case 0: //Diagrama de Estados
                    if ($.browser.msie) {
                        $('body', janela.document).html($('#diagramo', $aba).html());
                        if ($('#simulacao').is(':visible')) $('body', janela.document).append($('#simulacao').html());
                    }
                    else {
                        $('body', janela.document).append($('#diagramo', $aba).clone());
                        if ($('#simulacao').is(':visible')) $('body', janela.document).append($('#simulacao').clone());
                    }
                    $('body', janela.document).prepend('<center>Diagrama de Estados</center><br />');

                    break;
                case 1: //Mapa de Transição
                    if ($.browser.msie)
                        $('body', janela.document).html($aba.html());
                    else
                        $('body', janela.document).append($aba.clone());
                    $('body', janela.document).prepend('<center>Mapa de Transição</center><br />');
                    break;
                case 2: //Associação de Estados
                    if ($.browser.msie)
                        $('body', janela.document).html($aba.html());
                    else
                        $('body', janela.document).append($aba.clone());
                    $('body', janela.document).prepend('<center>Associação de Estados</center><br />');
                    break;
                case 3: //Tabela de Transição
                    if ($.browser.msie)
                        $('body', janela.document).html($aba.html());
                    else
                        $('body', janela.document).append($aba.clone());
                    $('body', janela.document).prepend('<center>Tabela de Transição</center><br />');
                    break;
                case 4: //Tabela de Excitação
                    if ($.browser.msie)
                        $('body', janela.document).html($aba.html());
                    else
                        $('body', janela.document).append($aba.clone());
                    $('body', janela.document).prepend('<center>Tabela de Excitação</center><br />');
                    break;
                case 5: //Síntese
                    if ($.browser.msie)
                        $('body', janela.document).html($aba.html());
                    else {
                        $('body', janela.document).append($aba.clone());
                        $('#tabelaSintese', janela.document).replaceWith('<div>' + $('#tabelaSintese').val().replace(/\n/g,'<br/>') + '</div>');
                    }
                    $('body', janela.document).prepend('<center>Síntese</center><br />');
                    break;
                case 6: //Ajuda
                    if ($.browser.msie)
                        $('body', janela.document).html($aba.html());
                    else
                        $('body', janela.document).append($aba.clone());
                    $('body', janela.document).prepend('<center>Ajuda</center><br />');
                    break;
            }
            $('body', janela.document).append('<br /><center>Gerado pelo OrangeCad Web</center>');

        } else {
            setTimeout(arguments.callee, 300);
        }

    })();
}