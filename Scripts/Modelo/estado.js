/// <reference path="../jquery-1.6.1-vsdoc.js" />
/// <reference path="../raphael.js" />
/// <reference path="diagrama.js" />
/// <reference path="../json2.js" />

var Estado = function (diagrama, posX, posY, sizeX, sizeY, radius) {
    /// <summary>
    ///     Pode ser representado por um dos casos abaixo:
    ///     &#10;1: Círculo.
    ///     &#10;    1.1 - Estado(diagrama, posX, posY, radius)
    ///     &#10;2: Elipse.
    ///     &#10;    2.1 - Estado(diagrama, posX, posY, radiusX, radiusY) 
    ///     &#10;3: Retângulo (radius é a curvatura das bordas).
    ///     &#10;    3.1 - Estado(diagrama, posX, posY, sizeX, sizeY, radius)
    /// </summary>
    /// <param name="diagrama" type="Diagrama">
    ///     O diagrama em que o estado estará contido
    /// </param>
    /// <param name="posX" type="inteiro">
    ///     Posição horizontal do estado no diagrama.
    /// </param>
    /// <param name="posY" type="inteiro">
    ///     Posição vertical do estado no diagrama.
    /// </param>
    /// <returns type="Estado" />
    var self = this;
    var uid = diagrama.Uid();
    this.tipo = "estado";

    //Variáveis
    this.posX = posX;
    this.posY = posY;
    this.selecionado = false;
    this.associacao = null; //Objeto jQuery do tr da associação desse estado.
    this.mapaTransicao = null; //Objeto jQuery do tr de transições desse estado.
    this.tabelaTransicao = null; //Objeto jQuery do tr de transições desse estado.

    this.diagrama = diagrama;

    this.id = diagrama.EstadoId();
    this.saida = [].AlterarTamanho(diagrama.saidaMoore, '0');
    this.codificacao = null;



    //this.text = this.id + '\n' + this.saida;

    this.type;
    this.graph;
    this.transicoes = new Array();
    //this.reta = null;

    //Cores de seleção.
    this.cores = {
        normal: '#000',
        selecionado: '#44C',
        transicao: '#F25',
        simulacao: '#3d35b8'
    };

    this.Uid = function () {
        return uid;
    }

    this.Exportar = function () {
        var r = {
            id: self.id,
            posX: self.posX,
            posY: self.posY,
            saida: self.saida.slice(),
            selecionado: self.selecionado
        };

        return r;
    }

    this.Redesenha = function (dx, dy) {
        self.gTexto.attr({ 'font-size': self.diagrama.Size(10) });
        self.graph.attr({ r: self.diagrama.Size(), 'stroke-width': self.diagrama.Size(2) });

        //        for (var i = 0; i < self.transicoes.length; i++) {
        //            if (self.transicoes[i].de == self)
        //                self.transicoes[i].Redesenha();
        //        }

        self.Move(dx, dy, true);
    }

    function Refresh() {
        self.gTexto.attr({ text: self.Texto() });
    }

    this.Refresh = Refresh;

    this.Texto = function (id, saida) {
        if (!id) return self.id + '\n' + self.saida.join('');

        if ((id || id == 0) && !saida) {
            self.id = id;
        }

        if ((id || id == 0) && (saida || saida == 0)) {
            self.id = id;
            self.saida = saida;
        }

        Refresh();

        return self;
    }

    this.Saida = function (posicao, valor) {
        if (!posicao && posicao != 0) return self.saida;
        if ((valor || valor == 0) && (posicao || posicao == 0)) {
            try {
                self.saida[parseInt(posicao)] = valor;
            } catch (e) {
                //if (console && if(exibirLog4213) console.log)
                if(exibirLog4213) console.log(e);
            }
        } else if (posicao || posicao == 0) {
            self.saida.AlterarTamanho(posicao, '0');
        }
        Refresh();

        return self;
    }

    //Iniciação
    this.gTexto = this.diagrama.paper.text(posX, posY, this.Texto());
    this.gTexto.attr({ 'font-size': this.diagrama.Size(10) + 'px' });
    if (arguments.length == 4) {
        this.type = 'circle';
        this.graph = this.diagrama.paper[this.type](posX, posY, sizeX);
        if(exibirLog4213) console.log('X.'+posX+' Y.'+posY+' S.'+ sizeX);
        this.radius = sizeX;
    } else if (arguments.length == 5) {
        this.type = 'ellipse';
        this.graph = this.diagrama.paper[this.type](posX, posY, sizeX, sizeY);
        this.sizeX = sizeX;
        this.sizeY = sizeY;
    } else if (arguments.length == 6) {
        this.type = 'rect';
        this.graph = this.diagrama.paper[this.type](posX - sizeX / 2, posY - sizeY / 2, sizeX, sizeY, radius);
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.radius = sizeX;
    }

    this.graph.estado = this;

    //var color = Raphael.getColor();
    hue = 0.5;
    this.graph.attr({ fill: /*"r(.5, .9)#aad-#fff"*/"#00f", stroke: '#000', "fill-opacity": 0, "stroke-width": self.diagrama.Size(2) });

    //Métodos
    this.remove = function () {
        self.diagrama.DeselecionarEstado(self); //Para o caso dele estar selecionado.
        self.graph.remove();
        self.gTexto.remove();
        self.associacao.remove();
        self.mapaTransicao.remove();
        self.tabelaTransicao.remove();
        //Artimanha para criar um referencia diferente de uma lista com os mesmos transicoes da outra
        //usei isso para poder passar todos caminha para função de deletar transicao
        var a = self.transicoes.slice(0, self.transicoes.length);
        self.RemoverTransicao(a);
        delete self;
    };

    this.Selecionar = function (cor) {
        if (!cor)
            if (self.diagrama.Comando() == 'selecionar')
                cor = self.cores.selecionado;
            else
                cor = self.cores.transicao;
        self.graph.attr('stroke', cor);
        self.selecionado = true;
    }

    this.Simula = function () {
        var cor = self.cores.simulacao;
        self.graph.animate({ 'stroke': cor, 'fill-opacity': 0.5 }, 1100, 'bounce');
    }

    this.Desimula = function () {
        var cor = self.cores.normal;
        self.graph.animate({ 'stroke': cor, 'fill-opacity': 0 }, 1100, 'bounce');
    }

    this.Deselecionar = function () {
        self.graph.attr('stroke', self.cores.normal);
        self.selecionado = false;
        return self;
    }

    this.RemoverTransicao = function (transicao) {
        if ($.isArray(transicao))
            $.each(transicao, function (key, val) {
                self.RemoverTransicao(val);
            });
        else $.each(self.transicoes, function (key, val) {
            if (val == transicao) {
                self.transicoes.removeByIndex(key);
                transicao.remove();
            }
        });

        return self;
    }

    this.ExisteTransicaoDe = function (de) {
        var r = false;

        $.each(self.transicoes, function (key, val) {
            if (val.de == de && val.para == self)
                r = true;
        });

        return r;
    }

    this.Reta = function (x, y) {
        if (self.reta == null) {
            Estado.prototype.reta = diagrama.paper.retaInvisivel(self.posX, self.posY, x, y); // self.reta = diagrama.paper.retaInvisivel(self.posX, self.posY, x, y);
        } else {
            var path = ["M" + self.posX, self.posY, "L" + x, y].join(',');
            self.reta.attr({ path: path });
        }
        return self.reta;
    }

    this.ContidoEm = function (xStart, yStart, xEnd, yEnd) {
        return Contido(self.posX, self.posY, xStart, yStart, xEnd, yEnd);
    }

    this.EstadoInicial = function () {
        self.diagrama.EstadoInicial(self);
    }

    this.Codificacao = function () {
        self.diagrama.Codificacao(self);
    }

    this.EstadoId = function (id) {
        self.diagrama.EstadoId(id, self);
    }

    this.ProximoEstado = function (entrada, codificacao) {
        //Retorna o id do próximo estado ou a codificação ou o objeto do próximo estado.
        //Uso:
        // 1º ProximoEstado(entrada) - retorna o id do próximo estado ou Indefinido caso não consiga definir o próximo estado
        // 2º ProximoEstado(entrada, true) - retorna a codificação do próximo estado ou Indefinido caso não consiga definir o próximo estado
        // 3º ProixmoEstado(entrada, 'transicao') - retorna o objeto Estado do próximo estado ou 'Indefinido'
        var possibilidades = 0;
        var para = null;
        var mealy = null;
        var resposta = '-';
        var transicao, e, contador;
        for (var i = 0; i < self.transicoes.length; i++) {
            transicao = self.transicoes[i];
            for (var j = 0; j < transicao.Entrada().length; j++) {
                if (transicao.de == self) {
                    e = transicao.Entrada()[j];
                    if (transicao.Entrada()[j].join('') == entrada) {
                        if (possibilidades || (para != null && (para != transicao.para || mealy != transicao.Saida()[j].join(''))) ) return 'Indefinido';
                        else {
                            if (para == null) {
                                para = transicao.para;
                                mealy = transicao.Saida()[j].join('');
                            }
                            else if (para != transicao.para) possibilidades++;
                            if (codificacao) resposta = transicao.para.codificacao;
                            else resposta = transicao.para.id;
                            if (codificacao == 'transicao') resposta = transicao.para;
                        }
                    } else {
                        contador = 0;
                        for (var k = 0; k < e.length; k++) {
                            contador += e[k] == entrada[k] || e[k] == 'X' ? 1 : 0;
                        }
                        if (contador == e.length) {
                            if (possibilidades || (para != null && (para != transicao.para || mealy != transicao.Saida()[j].join('')))) return 'Indefinido';
                            else {
                                if (para == null) {
                                    para = transicao.para;
                                    mealy = transicao.Saida()[j].join('');
                                }
                                else if (para != transicao.para) possibilidades++;
                                if (codificacao) resposta = transicao.para.codificacao;
                                else resposta = transicao.para.id;
                                if (codificacao == 'transicao') resposta = transicao.para;
                            }
                        }
                    }
                }
            }
        }

        return resposta;
    }

    this.EstadoAnterior = function (entrada, codificacao) {
        //Retorna o id do estado anterior ou a codificação ou o objeto do estado anterior.
        //Uso:
        // 1º EstadoAnterior(entrada) - retorna o id do próximo estado ou Indefinido caso não consiga definir o próximo estado
        // 2º EstadoAnterior(entrada, true) - retorna a codificação do próximo estado ou Indefinido caso não consiga definir o próximo estado
        // 3º EstadoAnterior(entrada, 'transicao') - retorna o objeto Estado do próximo estado ou 'Indefinido'
        var possibilidades = 0;
        var de = null;
        var resposta = '-';
        var transicao, e, contador;
        for (var i = 0; i < self.transicoes.length; i++) {
            transicao = self.transicoes[i];
            for (var j = 0; j < transicao.Entrada().length; j++) {
                if (transicao.para == self) {
                    e = transicao.Entrada()[j];
                    if (transicao.Entrada()[j].join('') == entrada) {
                        if (possibilidades || (de != null && de != transicao.de)) return 'Indefinido';
                        else {
                            if (de == null) de = transicao.de;
                            else if (de != transicao.de) possibilidades++;
                            if (codificacao) resposta = transicao.de.codificacao;
                            else resposta = transicao.de.id;
                            if (codificacao == 'transicao') resposta = transicao.de;
                        }
                    } else {
                        contador = 0;
                        for (var k = 0; k < e.length; k++) {
                            contador += e[k] == entrada[k] || e[k] == 'X' ? 1 : 0;
                        }
                        if (contador == e.length) {
                            if (possibilidades || (de != null && de != transicao.de)) return 'Indefinido';
                            else {
                                if (de == null) de = transicao.de;
                                else if (de != transicao.de) possibilidades++;
                                if (codificacao) resposta = transicao.de.codificacao;
                                else resposta = transicao.de.id;
                                if (codificacao == 'transicao') resposta = transicao.de;
                            }
                        }
                    }
                }
            }
        }

        return resposta;
    }

    this.Move = function (dx, dy, mantemBolaCurva) {
        var diagrama = self.diagrama;
        var graph = self.graph;

        graph.ox = graph.type == "rect" ? graph.attr("x") : graph.attr("cx");
        graph.oy = graph.type == "rect" ? graph.attr("y") : graph.attr("cy");

        var att = graph.type == "rect" ? { x: graph.ox + dx, y: graph.oy + dy} : { cx: graph.ox + dx, cy: graph.oy + dy };
        var attTexto = { x: graph.ox + dx, y: graph.oy + dy };

        graph.attr(att);
        self.gTexto.attr(attTexto);
        if (self == diagrama.EstadoInicial()) diagrama.BolaInicial(att);

        if(exibirLog4213) console.log(dx + ":" + dy);
        for (var i = self.transicoes.length; i--; ) {
            if (mantemBolaCurva && !self.transicoes[i].distanciaVelha) {
                self.transicoes[i].distanciaVelha = DistanciaEntrePontos(self.transicoes[i].controls[0].attr('cx'), self.transicoes[i].controls[0].attr('cy'),
                                                                              self.transicoes[i].controls[2].attr('cx'), self.transicoes[i].controls[2].attr('cy'));
                self.transicoes[i].distanciaVelhaCurva = DistanciaEntrePontos(self.transicoes[i].controls[0].attr('cx'), self.transicoes[i].controls[0].attr('cy'),
                                                                              self.transicoes[i].controls[1].attr('cx'), self.transicoes[i].controls[1].attr('cy'));
                self.transicoes[i].distanciaVelhaTexto = DistanciaEntrePontos(self.transicoes[i].controls[0].attr('cx'), self.transicoes[i].controls[0].attr('cy'),
                                                                              self.transicoes[i].texto.attr('x'), self.transicoes[i].texto.attr('y'));
                self.transicoes[i].anguloCurva = AnguloEntrePontos(self.transicoes[i].controls[0].attr('cx'), self.transicoes[i].controls[0].attr('cy'),
                                                                              self.transicoes[i].controls[1].attr('cx'), self.transicoes[i].controls[1].attr('cy'));
                self.transicoes[i].anguloTexto = AnguloEntrePontos(self.transicoes[i].controls[0].attr('cx'), self.transicoes[i].controls[0].attr('cy'),
                                                                              self.transicoes[i].texto.attr('x'), self.transicoes[i].texto.attr('y'));
                //self.transicoes[i].oldCurvaX = self.transicoes[i].controls[1].attr('cx');
                //self.transicoes[i].oldCurvaY = self.transicoes[i].controls[1].attr('cy');
                //self.transicoes[i].oldTextoX = self.transicoes[i].texto.attr('x');
                //self.transicoes[i].oldTextoY = self.transicoes[i].texto.attr('y');
            }
            var c;
            if (self.transicoes[i].de == self) {
                c = self.transicoes[i].controls[0];

                c.update((dx - (c.dx || 0)), (dy - (c.dy || 0)), true && !mantemBolaCurva);
                c.dx = dx;
                c.dy = dy;
            }
            if (self.transicoes[i].para == self) {
                c = self.transicoes[i].controls[2];

                c.update((dx - (c.dx || 0)), (dy - (c.dy || 0)), true /*&& (self.transicoes[i].de != self.transicoes[i].para) */ && !mantemBolaCurva);
                c.dx = dx;
                c.dy = dy;
            }
        }

        self.posX = graph.attr('cx');
        self.posY = graph.attr('cy');

        for (var i = self.transicoes.length; i--; ) {
            var c;
            if (self.transicoes[i].de == self) {
                c = self.transicoes[i].controls[0];
                c.dx = c.dy = 0;
            }
            if (self.transicoes[i].para == self) {
                c = self.transicoes[i].controls[2];
                c.dx = c.dy = 0;
            }
        }
        diagrama.paper.safari();
    }
}
Estado["toString"] = function () {
    return "Classe de Modelo para os Estados\nCriado por Gabriela Silva Ribeiro.";
}