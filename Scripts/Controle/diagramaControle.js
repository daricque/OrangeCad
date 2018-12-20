/// <reference path="../Modelo/estado.js" />
/// <reference path="../raphael.js" />
/// <reference path="../Modelo/diagrama.js" />
/// <reference path="mapaTransicaoControle.js" />

function CriarEstado (diagrama, posX, posY, sizeX, sizeY, radius) {
    var estado = new Estado(diagrama, posX, posY, sizeX); //só círculo

    diagrama.AdicionarEstado(estado);

    estado.graph.drag(move, dragger, up);
    $(estado.graph[0]).click(estado, clicado).mouseup(estado, mouse_soltou).dblclick(estado, duplo_click).mousedown(estado, estado_down);

    diagrama.timeline.Salvar('CriarEstado');

    return estado;
}

var diagrama_clicked = function (e) {
    //            $.each(e,function(key,val){
    //                if(exibirLog4213) console.log(key+":"+val);
    //            });
    //var a = new Estado(self, e.screenX, e.screenY);

    ExportarShow(false);
    ImportarShow(false);

    var diagrama = e.data;

    //Precisei fazer isso por questão de compatibilidade com o firefox. Ele chama o event 'click' em qualquer circunstância.
    if (!diagrama.mouseup) {

        //Deseleciona todos elementos selecionado se o clique for no canvas do diagrama.
        if ((diagrama.Comando() == "selecionar" || diagrama.Comando() == "transicao") && e.target == diagrama.paper.canvas && !e.ctrlKey) {
            diagrama.DeselecionarTodos();
//            if (diagrama.Comando() == "transicao")
//                $('#selecionar').click();
        }

        if (diagrama.Comando() == "criar" && e.target == diagrama.paper.canvas) {
            CriarEstado(diagrama, (e.layerX ? e.layerX : e.offsetX), (e.layerY ? e.layerY : e.offsetY), diagrama.Size());
            //            var estado = new Estado(diagrama, (e.layerX ? e.layerX : e.offsetX), (e.layerY ? e.layerY : e.offsetY), diagrama.Size());

            //            diagrama.AdicionarEstado(estado);

            //            estado.graph.drag(move, dragger, up);
            //            $(estado.graph[0]).click(estado, clicado).mouseup(estado, mouse_soltou).dblclick(estado, duplo_click).mousedown(estado, estado_down);

            //        $.each(e, function (key, val) {
            //            if(exibirLog4213) console.log(key + ":" + val);
            //        });

            //b.drag(onmove, onstart, onend, move_scope, start_scope, end_scope);

            //        b.graph.click(function (e) {
            //            e.stopPropagation();
            //            e.preventDefault();
            //        });

            //var c = new Estado(self, e.offsetX, e.offsetY);
            if(exibirLog4213) console.log("screen: X." + e.screenX + ' Y.' + e.screenY);
            if(exibirLog4213) console.log("offset: X." + e.offsetX + ' Y.' + e.offsetY);
            if(exibirLog4213) console.log("layer: X." + e.layerX + ' Y.' + e.layerY);
            if(exibirLog4213) console.log("page: X." + e.pageX + ' Y.' + e.pageY);
            if(exibirLog4213) console.log("posicao: X." + (e.layerX ? e.layerX : e.offsetX) + ' Y.' + (e.layerY ? e.layerY : e.offsetY));
        }
        //        if (diagrama.Comando() == "deletar") {
        //            diagrama.RemoverEstado(e.target, true);
        //            //        $.each(e, function (key, val) {
        //            //            if(exibirLog4213) console.log(key + ":" + val);
        //            //        });
        //        }
    }
}

var diagrama_up = function (e) {
    var diagrama = e.data;
    diagrama.mouseup = false;

    $(diagrama.paper.canvas).unbind('mousemove');
    if (diagrama.Comando() == "selecionar" || diagrama.Comando() == "transicao" || diagrama.Comando() == "deletar") {
        if (diagrama.Quadrado().xStart != diagrama.Quadrado().xEnd && diagrama.Quadrado().yStart != diagrama.Quadrado().yEnd) {
            if (!e.ctrlKey) diagrama.DeselecionarTodos();

            var old = diagrama.estados.length;

            for (var i = diagrama.estados.length - 1; i >= 0; i--) {
                var val = diagrama.estados[i];

                //$.each(diagrama.estados, function (key, val) {
                if (val) {
                    if(exibirLog4213) console.log(val.ContidoEm(diagrama.quadrado.xStart, diagrama.quadrado.yStart, diagrama.quadrado.xEnd, diagrama.quadrado.yEnd));
                    if (val.ContidoEm(diagrama.quadrado.xStart, diagrama.quadrado.yStart, diagrama.quadrado.xEnd, diagrama.quadrado.yEnd)) {
                        if (diagrama.Comando() == "deletar") {
                            diagrama.RemoverEstado(val);
                            continue;
                        } else if (!val.selecionado) {
                            val.Selecionar();
                            diagrama.SelecionarEstado(val);
                        }
                    }

                    $.each(val.transicoes, function (key, vala) {
                        if (vala) {
                            if(exibirLog4213) console.log(val.id);
                            if(exibirLog4213) console.log(vala.de == val && vala.ContidoEm(diagrama.quadrado.xStart, diagrama.quadrado.yStart, diagrama.quadrado.xEnd, diagrama.quadrado.yEnd));
                            if (vala.de == val && vala.ContidoEm(diagrama.quadrado.xStart, diagrama.quadrado.yStart, diagrama.quadrado.xEnd, diagrama.quadrado.yEnd)) {
                                if (diagrama.Comando() == "deletar") {
                                    diagrama.RemoverElemento(vala, true);
                                } else if (!vala.selecionado) {
                                    vala.SelecionarCurva();
                                    diagrama.SelecionarTransicao(vala);
                                }
                            }
                        }
                    });
                }
                //});
            }

            if (old != diagrama.estados.length) diagrama.timeline.Salvar('diagrama_up_mudou_quantidade_estados');

            diagrama.mouseup = true;
        }
    } else if (diagrama.Comando() == 'arrastar') {
        diagrama.Move(false);
        diagrama.mouseup = true;
        diagrama.timeline.Salvar('diagrama_up_arrastou');
    }
    diagrama.Quadrado(0, 0, 0, 0).hide();
}

var diagrama_duplo = function (e) {
    var diagrama = e.data;
    diagrama.timeline.Ativo(false);

    if (diagrama.Comando() == "selecionar")
        $.each(diagrama.estados, function (key, val) {
            $.each(val.transicoes, function (key, vala) {
                diagrama.paper.transicao(vala);
            });
        });

    diagrama.timeline.Ativo(true);
    if (diagrama.timeline.UltimoSave().donde != 'diagrama_duplo') diagrama.timeline.Salvar('diagrama_duplo');
}

var diagrama_down = function (e) {
    var diagrama = e.data;
    //ImprimePropriedades(e);
    if (diagrama.Comando() == "selecionar" || diagrama.Comando() == "transicao" || diagrama.Comando() == "deletar") {
        if (e.target == diagrama.paper.canvas) {
            diagrama.Quadrado((e.layerX ? e.layerX : e.offsetX), (e.layerY ? e.layerY : e.offsetY), (e.layerX ? e.layerX : e.offsetX), (e.layerY ? e.layerY : e.offsetY));
            $(diagrama.paper.canvas).mousemove(diagrama, diagrama_move);
            diagrama.Quadrado().show();
            e.preventDefault();
            //return false;
        }
    } else if (diagrama.Comando() == 'arrastar') {
        diagrama.Move(e.screenX, e.screenY);
        $(diagrama.paper.canvas).mousemove(diagrama, diagrama_arrasta);
    }
    if (e.target == diagrama.paper.canvas) {
        e.preventDefault();
    }
}

var diagrama_arrasta = function (e) {
    var diagrama = e.data;
    diagrama.Move(e.screenX, e.screenY);
}

var diagrama_move = function (e) {
    var diagrama = e.data;
    //    if(exibirLog4213) console.log("client: X." + e.clientX + ' Y.' + e.clientY);
    //    if(exibirLog4213) console.log("screen: X." + e.screenX + ' Y.' + e.screenY);
    //    if(exibirLog4213) console.log("offset: X." + e.offsetX + ' Y.' + e.offsetY);
    //    if(exibirLog4213) console.log("layer: X." + e.layerX + ' Y.' + e.layerY);
    //    if(exibirLog4213) console.log("page: X." + e.pageX + ' Y.' + e.pageY);
    diagrama.Quadrado((e.layerX ? e.layerX : e.offsetX), (e.layerY ? e.layerY : e.offsetY));
    //e.preventDefault();
    //return false;
}

var diagrama_selecionados_mudou = function (diagrama, donde) {
    if(exibirLog4213) console.log('mudou ' + donde + ' qtd ' + diagrama.selecionados.length);
    var $opcao = $('#opcao');
    var tempoOut = [{ height: "hide" }, 100, 'swing'];
    var tempoIn = [{ height: "show" }, 600, 'easeOutExpo'];
    var efeitoSumir = 'animate';
    var efeitoAparecer = 'animate';

    $('#idEstado').blur();

    if (diagrama.Comando() == 'selecionar') {
        //    var tempoSlide = 350;
        //    var efeitoSumir = 'slideUp';
        //    var efeitoAparecer = 'slideDown';

        //$opcao.children().stop();

        if (diagrama.selecionados.length == 0) {
            //$opcao.children().stop(true, true).slideUp(tempoSlide);
            //$opcao.children().stop(true, true)[efeitoSumir](tempoSlide);
            $opcao.children().stop(true, true)[efeitoSumir](tempoOut[0], tempoOut[1], tempoOut[2]);
            $('#saidaMealy', $opcao).find('div').hide();
            $('#entradaTransicao', $opcao).find('div').hide();
            return;
        }
        if (diagrama.selecionados.length == 1) {
            var e = diagrama.selecionados[0];
            //$opcao.children().slideUp(tempoSlide);

            if (diagrama.selecionados[0].tipo == "estado") {
                //$('#estado').siblings().stop(true, true).slideUp(tempoSlide).end().slideDown(tempoSlide);
                //$('#estado').siblings().stop(true, true)[efeitoSumir](tempoSlide).end()[efeitoAparecer](tempoSlide);
                //$('#estado').siblings().stop(true, true)[efeitoSumir](tempoOut[0], tempoOut[1], tempoOut[2]).end()[efeitoAparecer](tempoIn[0], tempoIn[1], tempoIn[2]);
                $('#estado').showOnlyThis();
                $opcao.find('#estadoId').text(e.id);
                $opcao.find('#idEstado').val(e.id);
                MontarBits(diagrama, $('#saidaMoore', $opcao), e);
            }

            if (diagrama.selecionados[0].tipo == "transicao") {
                //$('#transicao').siblings().stop(true, true).slideUp(tempoSlide).end().slideDown(tempoSlide);
                //$('#transicao').siblings().stop(true, true)[efeitoSumir](tempoSlide).end()[efeitoAparecer](tempoSlide);
                //$('#transicao').siblings().stop(true, true)[efeitoSumir](tempoOut[0], tempoOut[1], tempoOut[2]).end()[efeitoAparecer](tempoIn[0], tempoIn[1], tempoIn[2]);
                $('#transicaoOpt').showOnlyThis();
                $opcao.find('#transicaoId').text(e.de.id + ' para ' + e.para.id);
                MontarBitsLinhas(diagrama, e, $('#entradaTransicao', $opcao), $('#saidaMealy', $opcao));
                var $entrada = $('#entradaTransicao', $opcao);
                var novoWidth = ($entrada.find('label:first').width() + 4) * e.entradas[0].length;

                if (novoWidth > $entrada.parent().width() / 2.1)
                    novoWidth = $entrada.parent().width() / 2.1;

                $entrada.width(novoWidth);

                //MontarBits(diagrama, $('#entradaTransicao', $opcao), e, true);
                //MontarBits(diagrama, $('#saidaMealy', $opcao), e);
            }
            $opcao.show();
            return;
        } else if (diagrama.selecionados.length > 1) {
            //$('#elementos').siblings().stop(true, true).slideUp(tempoSlide).end().slideDown(tempoSlide);
            //$('#elementos').siblings().stop(true, true)[efeitoSumir](tempoSlide).end()[efeitoAparecer](tempoSlide);
            //$('#elementos').siblings().stop(true, true)[efeitoSumir](tempoOut[0], tempoOut[1], tempoOut[2]).end()[efeitoAparecer](tempoIn[0], tempoIn[1], tempoIn[2]);
            $('#elementos').showOnlyThis();
            $opcao.find('#quantidadeSelecionados').text(diagrama.selecionados.length);
            return;
        }
    } else {
        $opcao.children().stop(true, true)[efeitoSumir](tempoOut[0], tempoOut[1], tempoOut[2]);
        $('#saidaMealy', $opcao).find('div').hide();
        $('#entradaTransicao', $opcao).find('div').hide();
    }
};

var diagrama_mudar_saidaMoore = function (diagrama, valor) {
    if (!valor && valor != 0) return false;

    diagrama.saidaMoore = valor;

    var i = diagrama.estados.length;
    while (i--) diagrama.estados[i].Saida(valor);

    var $saida = $('#saidaMoore');

    MontarBits(diagrama, $saida, valor);

//    if (diagrama.timeline)
//        diagrama.timeline.Salvar();

    return diagrama;
}

var diagrama_mudar_saidaMealy = function (diagrama, valor) {
    if (!valor && valor != 0) return false;

    diagrama.saidaMealy = valor;

    var i = diagrama.estados.length;
    var j;
    var estado, transicoes;
    while (i--) {
        estado = diagrama.estados[i];
        transicoes = estado.transicoes;
        j = transicoes.length;
        while (j--) {
            if (transicoes[j].de == estado)
                transicoes[j].Saida(valor);
        }
    }

    //var $saida = $('#saidaMealy');

    //MontarBits(diagrama, $saida, valor, false, 0);
//    if (diagrama.timeline)
//        diagrama.timeline.Salvar();

    return diagrama;
}

var diagrama_mudar_Entrada = function (diagrama, valor) {
    if (!valor) return false;

    diagrama.entradas = valor;

    var i = diagrama.estados.length;
    var j;
    var estado, transicoes;
    while (i--) {
        estado = diagrama.estados[i];
        transicoes = estado.transicoes;
        j = transicoes.length;
        while (j--) {
            if (transicoes[j].de == estado)
                transicoes[j].Entrada(valor);
        }
    }

    //var $entrada = $('#entradaTransicao');

    //MontarBits(diagrama, $entrada, valor, true, 0);
    //tabelaTransicoes(diagrama, diagrama.tabelaMapaTransicao,0);
    //tabelaTransicoes(diagrama, diagrama.tabelaTransicao,0,false,true);

    tabelaTransicoes(diagrama, diagrama.tabelaMapaTransicao, false, false, false);

    tabelaTransicoes(diagrama, diagrama.tabelaTransicao, false, false, true);

//    if(diagrama.timeline)
//        diagrama.timeline.Salvar();

    return diagrama;
}

var MontarBits = function (diagrama, $elemento, valor, entrada, linha) {
    if (valor.tipo && valor.tipo == "estado") {
        var estado = valor;
        var t = estado.saida.length;
        $(':checkbox, :checkbox + label', $elemento).each(function (i, e) {
            //        $('button', $elemento).each(function (i, e) {
            //if (estado.saida[i] == '0') $(this).attr('checked', false);
            //if (estado.saida[i] == '1') $(this).attr('checked', true);
            if(exibirLog4213) console.log(parseInt(i / 2 + i % 2));
            $(this).button('option', 'label', estado.saida[parseInt(i / 2)]);
            CorrectIcon(this,false);
        });

        return;
    }

    if (valor.tipo && valor.tipo == "transicao") {
        if (!linha) linha = 0;
        var transicao = valor;
        if (!entrada) {
            $(':checkbox, :checkbox + label', $elemento).each(function (i, e) {
                //            $('button', $elemento).each(function (i, e) {
                //if (transicao.saidas[i] == '0') $(this).attr('checked', false);
                //if (transicao.saidas[i] == '1') $(this).attr('checked', true);
                //                if(exibirLog4213) console.log(parseInt(i / 2 + i % 2));
                $(this).button('option', 'label', transicao.saidas[linha][parseInt(i / 2)]);
                CorrectIcon(this, false);
            });
        }

        if (entrada) {
            $(':checkbox, :checkbox + label', $elemento).each(function (i, e) {
                //            $('button', $elemento).each(function (i, e) {
                //if (transicao.entradas[i] == '0') $(this).attr('checked', false);
                //if (transicao.entradas[i] == '1') $(this).attr('checked', true);
                //                if(exibirLog4213) console.log(parseInt(i / 2 + i % 2));
                $(this).button('option', 'label', transicao.entradas[linha][parseInt(i / 2)]);
                CorrectIcon(this, true);
            });
        }
        return;
    }

    var qtdAnterior = $(':checkbox', $elemento).length;
    //    var qtdAnterior = $('button', $elemento).length;
    if (qtdAnterior > valor) {
        //é só retirar os elementos
        if (valor > 0)
            $(':checkbox, :checkbox + label', $elemento).filter(':gt(' + (valor * 2 - 1) + ')').remove();
        //            $('button', $elemento).filter(':gt(' + (valor * 2 - 1) + ')').remove();
        else
            $(':checkbox, :checkbox + label', $elemento).remove();
        //            $('button', $elemento).remove();
        return;
    }
    if (qtdAnterior < valor) {
        //adicionar novos elementos
        while (qtdAnterior++ < valor)
            Bit(diagrama, $elemento, qtdAnterior - 1, entrada, linha);

        return;
    }
}

function CorrectIcon(elem, dontCare) {
    if (dontCare) {
        if ($(elem).button('option', 'label') == '0')
            $(elem).button({
                icons: {
                    primary: "ui-icon-circle-triangle-s"
                }
            });
        else if ($(elem).button('option', 'label') == '1')
            $(elem).button({
                icons: {
                    primary: "ui-icon-circle-triangle-n"
                }
            });
        else if ($(elem).button('option', 'label') == 'X')
            $(elem).button({
                icons: {
                    primary: "ui-icon-circle-minus"
                }
            });
        } else {
            if ($(elem).button('option', 'label') == '0')
                $(elem).button({
                    icons: {
                        primary: "ui-icon-circle-triangle-s"
                    }
                });
                else if ($(elem).button('option', 'label') == '1')
                    $(elem).button({
                    icons: {
                        primary: "ui-icon-circle-triangle-n"
                    }
                });
    }
}

function MontarBitsLinhas(diagrama, transicao, $entrada, $saidaMealy) {
    $entrada.find('div').hide();
    $saidaMealy.find('div').hide();
    for (var i = 0; i < transicao.entradas.length; i++) {
        //        var $divEntrada = $('<div id="linhaEntrada' + i + '"></div>').appendTo($entrada);
        //        var $divSaida = $('<div id="linhaSaida' + i + '"></div>').appendTo($saidaMealy);

        var $divEntrada = $('#linhaEntrada' + i);
        if ($divEntrada.length == 0 || $divEntrada.find(':checkbox').length != transicao.entradas[i].length) { //Senão existe esta linha ainda ou a linha contém um número diferente de elementos.
            $divEntrada = $divEntrada.length ? $divEntrada : $('<div id="linhaEntrada' + i + '"></div>').appendTo($entrada);
            MontarBits(diagrama, $divEntrada, transicao.entradas[i].length, true, i); //Cria os elementos da linha
            MontarBits(diagrama, $divEntrada, transicao, true, i); //Associa os elementos da entrada da linha com os do transicao
        } else { //Elementos já existem, é só associar
            MontarBits(diagrama, $divEntrada, transicao, true, i); //Associa entrada
        }
        $divEntrada.show();

        var $divSaida = $('#linhaSaida' + i);
        if ($divSaida.length == 0 || $divSaida.find(':checkbox').length != transicao.saidas[i].length) { //Senão existe esta linha ainda ou a linha contém um número diferente de elementos.
            $divSaida = $divSaida.length ? $divSaida : $('<div id="linhaSaida' + i + '"></div>').appendTo($saidaMealy);
            MontarBits(diagrama, $divSaida, transicao.saidas[i].length, false, i); //Cria os elementos da linha
            MontarBits(diagrama, $divSaida, transicao, false, i); //Associa os elementos da entrada da linha com os da transicao
            if ($('#delBit' + i).length)
                $('#delBit' + i).appendTo($divSaida);
            else
                $('<span id="delBit' + i + '" data-linha="' + i + '">Excluir</span>').appendTo($divSaida)
                                                              .button()
                                                              .click([diagrama, $entrada, $saidaMealy], function (e) {
                                                                  var diagrama = e.data[0];
                                                                  var transicao = diagrama.selecionados[0];
                                                                  var $entrada = e.data[1];
                                                                  var $saidaMealy = e.data[2];
                                                                  var linha = $(this).data('linha');

                                                                  if (transicao.Entrada().length > 1) {

                                                                      transicao.Entrada(linha, -1);
                                                                      transicao.Saida(linha, -1);

                                                                      MontarBitsLinhas(diagrama, transicao, $entrada, $saidaMealy);
                                                                  } else {
                                                                      $(this).parent().parent().parent().animate({
                                                                          opacity: 0.2
                                                                      }, {
                                                                          duration: 500,
                                                                          specialEasing: {
                                                                              opacity: 'easeOutBounce'
                                                                          },
                                                                          complete: function () {
                                                                              $(this).animate({
                                                                                  opacity: 1
                                                                              }, {
                                                                                  duration: 300,
                                                                                  specialEasing: {
                                                                                      opacity: 'easeInBounce'
                                                                                  }
                                                                              }).removeClass('ui-state-error');
                                                                          }
                                                                      }).addClass('ui-state-error');
                                                                      //.addClass('ui-state-error');
                                                                  }
                                                              });
        } else { //Elementos já existem, é só associar
            MontarBits(diagrama, $divSaida, transicao, false, i); //Associa saída    
            $('#delBit' + i).appendTo($divSaida);
        }
        $divSaida.show();

        //MontarBits(diagrama, $divSaida, transicao.saidas[0].length, false, i);
    }
}

function BitCallback(diagrama, posicao, valor, entrada, linha) {
    var elemento = diagrama.selecionados[0];
    //var posicao = $(e.target).val();
    //var valor = $(e.target).button('option', 'label');

    //$(e.target).attr('checked', true);
    if (linha || linha === 0) //Transicao
        if (entrada) {
            elemento.Entrada(linha, posicao, valor);
        } else {
            elemento.Saida(linha, posicao, valor);
        }
    else //Estado, só tem uma saída e não tem entrada.
        elemento.Saida(posicao, valor);
}

var contadorUnico2917873 = 0;

function Bit(diagrama, elemento, posicao, temDontCare, linha) {
    //this.contador || (this.contador = 0) == 0;
    !linha && linha != 0 && (linha = false);
    $('<input type="checkbox" id="bit' + (contadorUnico2917873) + '" data-valor="' + posicao + '" data-linha="' + linha + '" value="' + posicao + '"/><label data-valor="' + posicao + '" data-linha="' + linha + '" for="bit' + (contadorUnico2917873++) + '"></label>').appendTo(elemento)
            .bit(temDontCare).click(diagrama, function (e) {
                var diagrama;
                var posicao;
                var linha;
                var valor;

                //                if ($.browser.msie) {

                diagrama = e.data;
                posicao = $(this).data('valor');
                linha = $(this).data('linha');
                valor = $(this).button('option', 'label');
                if(exibirLog4213) console.log(valor);
                BitCallback(diagrama, posicao, valor, temDontCare, linha);
                diagrama.timeline.Salvar('bit_mudou');
                //e.stopImmediatePropagation();
                if(exibirLog4213) console.log('passou:' + Math.random());
                return false;
                //                } else {
                //                    if ($(this).is(':checkbox')) {
                //                        if(exibirLog4213) console.log($(this).data("linha"));
                //                        diagrama = e.data;
                //                        posicao = $(this).data('valor');
                //                        linha = $(this).data('linha');
                //                        valor = $(this).button('option', 'label');

                //                        BitCallback(diagrama, posicao, valor, temDontCare, linha);
                //                    }
                //                }
            });
            if(exibirLog4213) console.log(contadorUnico2917873);
    //    $('<button id="saida' + this.contador + '" value="' + this.contador  + '">' + posicao + '</button>').appendTo(elemento);
    //$('#saida'+this.contador++).bit(temDontCare);
}