/// <reference path="../jquery-1.6.1-vsdoc.js" />
/// <reference path="../raphael.js" />
/// <reference path="estado.js" />
/// <reference path="../json2.js" />

var Diagrama = function (posX, posY, sizeX, sizeY) {
    var self = this;
    var countEstado = 0;
    var uid = 0;
    this.paper = null;
    this.zoom = 1;
    this.size = 25;
    this.mx = false; //x de translado
    this.my = false; //y de translado
    this.zx = false; //x de zoom
    this.zy = false; //y de zoom
    this.tipo = "diagrama";

    this.estadoInicial = false;
    this.estadoAtual = false;
    this.entradas = 3;
    this.saidaMoore = 2; //Moore
    this.saidaMealy = 0; //Mealy
    this.codificacao = "binario" //Possiveis valores: binario, gray e one-hot
    this.flipflop = "D";
    this.tipoDescricao = "EXPRESSO";
    this.tabelaAssociacao = null; //Objeto jQuery da tabela de associação
    this.tabelaMapaTransicao = null; //Objeto jQuery do mapa de transições
    this.tabelaTransicao = null; //Objeto jQuery da tabela de transições
    this.editor = null; //Objeto jQuery do campo que habilita os campos para edição.
    this.tabelaExcitacao = null; //Objeto jQuery da tabela de excitação
    this.tabelaSintese = null; //Objeto jQuery da área do código de síntese.
    this.simulacaoInterval = null; //IntervalID da simulação

    if (arguments.length == 1)
        this.paper = Raphael(posX);
    else if (arguments.length == 3)
        this.paper = Raphael(posX, posY, sizeX);
    else if (arguments.length == 4)
        this.paper = Raphael(posX, posY, sizeX, sizeY);

    this.selecionados = new Array();
    this.selecionadosSet = null;
    this.estados = new Array();
    this.config = oDefaults;

    this.AdicionarEstado = function (estado) {
        var n = self.estados.length;
        this.estados.push(estado);

        if (this.estados.length == 1) self.EstadoInicial(estado);

        self.Codificacao(estado); //seta a codificação para o estado
        //diagrama_selecionados_mudou(self);

        var associacao = $('<tr id="associacao' + n + '">').append('<td>').append('<td>').appendTo(self.tabelaAssociacao);

        associacao.find('td').data('estado', estado);
        associacao.find('td:first').text(estado.id).editavel(self, estado, 'EstadoId');
        associacao.find('td:eq(1)').text(estado.codificacao).editavel(self, estado, 'Codificacao');

        estado.associacao = associacao;

        self.RecodificaTodos();

        estado.mapaTransicao = $('<tr>').appendTo(self.tabelaMapaTransicao);
        estado.tabelaTransicao = $('<tr>').appendTo(self.tabelaTransicao);

        return self;
    }

    this.Bola = function () {
        if (self.quadrado == null) {
            Diagrama.prototype.bola = self.paper.circle(0, 0, self.Size(5));
        }
    }

    this.BolaInicial = function (x, y) {
        if (self.bola == null) {
            Diagrama.prototype.bola = self.paper.circle(0, 0, self.Size(self.size + 6)).hide();
        }

        if (typeof x == "object")
            self.bola.attr(x);
        else if ((x || x == 0) && (y || y == 0))
            self.bola.attr({ cx: x, cy: y });

        return self.bola;
    }

    this.Codificacao = function (codigo, estado, trocar) {
        if (codigo)
            if (!codigo.tipo) {//verifica se não é um estado
                //verifica se o codigo é válido, senão for retorna false.
                //se for verifica se alguém já tem e troca, se ninguém tiver, seta.
                if ((/^[0-1]+$/).test(codigo)) { //Verifica se o código passado é formado só por zeros e uns.
                    var numeroBits;

                    switch (self.codificacao) {
                        case "binario": //binario e gray podem ser feitos como um, pois aqui estamos setando o código passado no estado, e ambos utilizam a mesma quantidade de bits.
                        case "gray":
                            numeroBits = (self.estados.length - 1).toString(2).length;
                            if (numeroBits != codigo.length) return false;
                            //Se chegou até aqui, é porque o código é válido, é composto por 0 e 1 e tem o tamanho certo.
                            //Verificar se ele já existe em outro estado se trocar for true
                            if (trocar)
                                for (var i = 0; i < self.estados.length; i++) {
                                    if (self.estados[i] == estado) continue; //Não verifica o código do estado passado.
                                    else if (self.estados[i].codificacao == codigo) { //Caso tenha algum estado com o código, mudar o código desse para o código do estado que quer alterar, e sair do loop.
                                        self.estados[i].codificacao = estado.codificacao;
                                        self.estados[i].associacao.find('td:eq(1)').text(estado.codificacao);
                                        break;
                                    }
                                }
                            if (exibirLog4213) console.log(codigo.toString());
                            estado.codificacao = codigo.toString(); //Define o código do estado.
                            return true;
                        case "onehot":
                            numeroBits = self.estados.length;
                            if (numeroBits != codigo.length) return false;
                            //idem binario e gray, só muda o tamanho verificado.
                            if (trocar)
                                for (var i = 0; i < self.estados.length; i++) {
                                    if (self.estados[i] == estado) continue; //Não verifica o código do estado passado.
                                    else if (self.estados[i].codificacao == codigo) { //Caso tenha algum estado com o código, mudar o código desse para o código do estado que quer alterar, e sair do loop.
                                        self.estados[i].codificacao = estado.codigo;
                                        break;
                                    }
                                }
                            if (exibirLog4213) console.log(codigo.toString());
                            estado.codificacao = codigo.toString(); //Define o código do estado.
                            return true;
                        default: return false;
                    }
                }
            } else {
                //retorna o valor da codificação de acordo com a posição do estado (codigo é um estado e estado é a posição do estado)

                if (!estado) //se a posição do estado não foi passada, define
                    for (var i = 0; i < self.estados.length; i++) {
                        if (self.estados[i] == codigo) {
                            estado = i;
                            break;
                        }
                    }

                //define a codificação de acordo com o tipo
                switch (self.codificacao) {
                    case "binario":
                        if (!self.Codificacao(estado.toString(2).pad((self.estados.length - 1).toString(2).length), codigo))
                            return false;
                        break;
                    case "gray":
                        //n XOR (floor(n/2)) é uma fórmula mágica para se calcular o gray code de um número. em javascript se escreve: n ^ (n >> 1)
                        if (!self.Codificacao((estado ^ (estado >> 1)).toString(2).pad((self.estados.length - 1).toString(2).length), codigo)) //se não alterou com sucesso, retorna false
                            return false;
                        break;
                    case "onehot":
                        var cod = [].AlterarTamanho(self.estados.length, '0');
                        cod[estado] = '1';
                        if (!self.Codificacao(cod.reverse().join(''), codigo, trocar))
                            return false;
                        break;
                }
                return true;
            }

        return false;
    }

    this.Comando = function () {
        return self.config.comando;
    }

    this.DeselecionarTransicao = function (transicao) {
        if ($.isArray(transicao))
            $.each(transicao, function (key, val) {
                self.DeselecionarTransicao(val);
            });
        else $.each(self.selecionados, function (key, val) {
            if (val == transicao) {
                self.selecionados.removeByIndex(key);
                val.Deselecionar();
            }
        });

        diagrama_selecionados_mudou(self, 'DeselecionarTransicao');
        return self;
    }

    this.DeselecionarTransicoes = function (totalmente) {
        var a = self.selecionados.slice(0, self.selecionados.length);
        $.each(self.selecionados, function (key, val) {
            if (val.curve) {
                val.Deselecionar();
                if (totalmente)
                    self.selecionados.removeByIndex(key);
                else
                    val.SelecionarCurva();
            }
        });

        diagrama_selecionados_mudou(self, 'DeselecionarTransicoes');
        return self;
        //self.selecionados.remove(0, self.selecionados.length);
    }

    this.DeselecionarEstado = function (estado) {
        if ($.isArray(estado)) {
            $.each(estado, function (key, val) {
                self.DeselecionarEstado(val);
            });
        } else $.each(self.selecionados, function (key, val) {
            if (val == estado) {
                self.selecionados.removeByIndex(key);
                val.Deselecionar();
            }
        });

        diagrama_selecionados_mudou(self, 'DeselecionarEstado');
        return self;
    }

    this.DeselecionarTodos = function () {
        $.each(self.selecionados, function (key, val) {
            val.Deselecionar();
        });
        self.selecionados.remove(0, self.selecionados.length);

        diagrama_selecionados_mudou(self, 'DeselecionarTodos');
        return self;
    }

    this.Entradas = function (letra) {
        if (letra == null) letra = 'X';
        var r = '';
        for (var i = 0; i < self.entradas; i++) {
            r += letra;
        }
        return r;
    }

    this.EstadoAtual = function (estado, voltando) {
        if (estado) {
            if (self.estadoAtual) {
                self.estadoAtual.Desimula();
                if (!voltando)
                    for (var i = 0; i < self.estadoAtual.transicoes.length; i++) {
                        if (self.estadoAtual.transicoes[i].de == self.estadoAtual && self.estadoAtual.transicoes[i].para == estado) {
                            self.estadoAtual.transicoes[i].Simula();
                            break;
                        }
                    }
                else
                    for (var i = 0; i < self.estadoAtual.transicoes.length; i++) {
                        if (self.estadoAtual.transicoes[i].para == self.estadoAtual && self.estadoAtual.transicoes[i].de == estado) {
                            self.estadoAtual.transicoes[i].Desimula();
                            break;
                        }
                    }
            }
            self.estadoAtual = estado;
            self.estadoAtual.Simula();
        } else if (estado === false) {
            if (self.estadoAtual) self.estadoAtual.Desimula();
            self.estadoAtual = false;
        } else {
            return self.estadoAtual;
        }
    }

    this.EstadoInicial = function (estado) {
        if (estado && estado != self.estadoInicial) {
            //            if (estado == self.estadoInicial) { //Já é o estado inicial, remove.
            //                self.estadoInicial = false;
            //                self.BolaInicial().hide();
            //            } else { //Seta como estado inicial
            self.estadoInicial = estado;
            self.BolaInicial(estado.posX, estado.posY).show();
            //            }
        } else if (estado === false || estado === null) {
            if (self.estados.length > 0) self.EstadoInicial(self.estados[0]);
            else {
                self.estadoInicial = false;
                self.BolaInicial().hide();
            }
        }

        return self.estadoInicial;
    }

    this.EstadoId = function (id, estado) {
        if (estado && id) {
            for (var i = 0; i < self.estados.length; i++) {
                if (self.estados[i] != estado && self.estados[i].id == id) return false;
            }
            estado.id = id;
            estado.Texto(id);
            estado.associacao.find('td:first').text(id);
            return true;
        }
        return "S" + (++countEstado);
    }

    this.Exportar = function () {
        var to = {
            diagrama:
            {
                estadoInicial: self.estadoInicial ? self.estadoInicial.Uid() : false,
                entradas: self.entradas,
                saidaMoore: self.saidaMoore,
                saidaMealy: self.saidaMealy,
                codificacao: self.codificacao,
                flipflop: self.flipflop,
                tipoDescricao: self.tipoDescricao,
                zoom: self.zoom
            },
            estados: { /*length: 0*/
            },
            transicoes: { /*length: 0*/
            }
        };

        for (var i = 0; i < self.estados.length; i++) {
            var estado = self.estados[i];
            to.estados[estado.Uid()] = estado.Exportar();
            //to.estados.length++;
            for (var j = 0; j < estado.transicoes.length; j++) {
                var transicao = estado.transicoes[j];
                if (transicao.de == estado) {
                    to.transicoes[transicao.Uid()] = transicao.Exportar();
                    //to.transicoes.length++;
                }
            }
        }

        return to;
    }

    this.LimparTudo = function (novo) {
        self.selecionados.remove(0, self.selecionados.length);
        countEstado = 0;
        uid = 0;
        var a = self.estados.slice(0, self.estados.length);
        self.RemoverEstado(a);

        self.BolaInicial().hide();

        diagrama_selecionados_mudou(self, 'LimparTudo');

        if (novo) {
            self.timeline.Limpar();
            self.timeline.Salvar('LimparTudo');
        }

        return self;
    }

    this.Move = function (dx, dy) {
        if (!self.mx && self.mx !== 0) {
            self.mx = dx;
            self.my = dy;
            return;
        }

        if (dx === false) {
            self.mx = self.my = false;
            return;
        }

        var x = dx - self.mx;
        var y = dy - self.my;

        self.mx = dx;
        self.my = dy;

        for (var i = self.estados.length - 1; i >= 0; i--) {
            self.estados[i].Move(x, y);
        }
    }

    this.MudarCodificacao = function (tipoCodificacao) {
        if (tipoCodificacao) {
            switch (tipoCodificacao) {
                case "binario":
                case "gray":
                case "onehot": self.codificacao = tipoCodificacao;
                    break;
                default: return false;
            }
        }

        self.RecodificaTodos();

        return self;
    }

    this.MudarFlipFlop = function (flipflop) {
        self.flipflop = flipflop;
        montaTabelaExcitacao(self);
    }

    this.MudarTipoDescricao = function (tipoDescricao) {
        self.tipoDescricao = tipoDescricao;
        Sintese(self);
    }

    this.Quadrado = function (x, y, xStart, yStart) {
        if (self.quadrado == null) {
            if ((xStart || xStart == 0) && (yStart || yStart == 0))
                Diagrama.prototype.quadrado = self.paper.rect(x, y, xStart, yStart).hide(); // self.reta = diagrama.paper.retaInvisivel(self.posX, self.posY, x, y);
            else if ((x || x == 0) && (y || y == 0))
                Diagrama.prototype.quadrado = self.paper.rect(x, y, 0, 0).hide(); // self.reta = diagrama.paper.retaInvisivel(self.posX, self.posY, x, y);
            else
                Diagrama.prototype.quadrado = self.paper.rect(0, 0, 0, 0).hide(); // self.reta = diagrama.paper.retaInvisivel(self.posX, self.posY, x, y);

            if (!self.quadrado.xStart && !self.quadrado.yStart) {
                self.quadrado.xStart = 0;
                self.quadrado.yStart = 0;
            }
        }
        if ((x || x == 0) && (y || y == 0)) {
            if ((xStart || xStart == 0) && (yStart || yStart == 0)) {
                self.quadrado.xStart = xStart;
                self.quadrado.yStart = yStart;
            }

            self.quadrado.xEnd = x;
            self.quadrado.yEnd = y;

            //var path = ["M" + self.posX, self.posY, "L" + x, y].join(',');
            var width = Math.abs(self.quadrado.xStart - x);
            var height = Math.abs(self.quadrado.yStart - y);
            var xTopLeft = x > self.quadrado.xStart ? self.quadrado.xStart : x;
            var yTopLeft = y > self.quadrado.yStart ? self.quadrado.yStart : y;
            var att = { width: width, height: height, x: xTopLeft, y: yTopLeft };
            self.quadrado.attr(att);
        }
        return self.quadrado;
    }

    this.RecodificaTodos = function () {
        //var t = new Date();
        var associacao;
        for (var i = 0; i < self.estados.length; i++) {
            self.Codificacao(self.estados[i], i, false);

            associacao = self.estados[i].associacao;
            associacao.find('td:first').text(self.estados[i].id);
            associacao.find('td:eq(1)').text(self.estados[i].codificacao);
        }
        if (exibirLog4213) console.log('Recodificar demorou: ' + ((new Date()).getTime() - t.getTime()));
    }

    this.RemoverElemento = function (elemento, ehTransicao) {
        /// <summary>
        ///     Remove um ou mais estados ou elementos do diagrama e os deleta.
        ///     &#10;RemoverEstado(elemento[, isElement])
        /// </summary>
        /// <param name="elemento" type="Estado">
        ///     Estado ou elemento a serem retirados. Pode ser um ou uma lista. A lista pode ser mista, que a função reconhece.
        /// </param>
        /// <param name="isElement" type="boolean">
        ///     Diz se o que será retirado é Estado ou elemento.
        /// </param>
        /// <returns type="Diagrama" />

        if (elemento)
            if (!ehTransicao) {
                if ($.isArray(elemento)) {
                    for (var i = elemento.length; i >= 0; i--) {
                        self.RemoverElemento(elemento[i], elemento[i] && elemento[i].tipo && elemento[i].tipo == "transicao");
                    }
                    //                try {
                    //                    $.each(elemento, function (key, val) {
                    //                        self.Removerelemento(val, val.tipo && val.tipo == "transicao");
                    //                    });
                    //                } catch (e) {
                    //                    if(exibirLog4213) console.log(e);
                    //                    self.Removerelemento(elemento, isElement);
                    //                }
                } else $.each(self.estados, function (key, val) {
                    if (val == elemento) {
                        if (self.estadoInicial == elemento) {
                            self.estados.removeByIndex(key);
                            elemento.remove();
                            self.EstadoInicial(false);
                        } else {
                            self.estados.removeByIndex(key);
                            elemento.remove();
                        }

                        //delete estado;
                    }
                });
            } else {
                if ($.isArray(elemento))
                    $.each(elemento, function (key, val) {
                        self.RemoverElemento(val, val.tipo && val.tipo == "transicao");
                    });
                else {
                    elemento.remove();
                }
            }

        return self;
    }

    this.RemoverEstado = function (estado, isElement) {
        self.RemoverElemento(estado, isElement);
    }

    this.SelecionarEstado = function (estado) {
        if ($.isArray(estado)) {
            $.each(estado, function (key, val) {
                self.SelecionarEstado(val);
            });
        } else $.each(self.estados, function (key, val) {
            if (val == estado) {
                self.selecionados.push(estado);
            }
        });

        diagrama_selecionados_mudou(self, 'SelecionarEstado');
        return self;
    }

    this.SelecionarTransicao = function (transicao) {
        if ($.isArray(transicao))
            $.each(transicao, function (key, val) {
                self.SelecionarTransicao(val);
            });
        else self.selecionados.push(transicao);

        diagrama_selecionados_mudou(self, 'SelecionarTransicao');
        return self;
    }

    this.SelecionarTodos = function () {
        var estado, transicao;
        self.DeselecionarTodos();
        if (self.estados.length) self.SelecionarEstado(self.estados);
        for (var i = 0; i < self.estados.length; i++) {
            estado = self.estados[i];
            if (exibirLog4213) console.log(estado);
            estado.Selecionar();
            if (exibirLog4213) console.log(estado);
            for (var j = 0; j < estado.transicoes.length; j++) {
                transicao = estado.transicoes[j];
                if (transicao.de == estado) {
                    transicao.SelecionarCurva();
                    self.SelecionarTransicao(transicao);
                }
            }
        }
        diagrama_selecionados_mudou(self, 'SelecionarTodos');
    }

    this.Simula = function (passo, etapa) {
        return Simulacao(self, passo, etapa);
    }

    this.Size = function (size) {
        if (size) return size * self.zoom;
        else return self.size * self.zoom;
    }

    this.Uid = function () {
        return 'uid' + uid++;
    }

    this.Zoom = function (zoom) {
        //zoom é o zoom atual
        //this.zoom é o zoom anterior
        if (this.zoom == zoom) return false;

        var diffZoom = zoom / this.zoom - 1;
        this.zx = $('#diagramo').width() / 2;
        this.zy = $('#diagramo').height() / 2;

        if (this.cross) this.cross.attr({ path: "M" + (this.zx - 10) + ',' + this.zy +
                                 "l20,0m-10,-10l0,20"
        , 'stroke-opacity': 1
        });
        else this.cross = self.paper.path("M" + (this.zx - 10) + ',' + this.zy +
                                 "l20,0m-10,-10l0,20");

        this.zoom = zoom;

        self.BolaInicial().attr({ 'r': self.Size(self.size + 6) });

        var estado;

        for (var i = self.estados.length - 1; i >= 0; i--) {
            estado = self.estados[i];

            if (exibirLog4213) console.log(diffZoom + ' ' + (estado.posX - this.zx) + ' ' + (estado.posY - this.zy));

            //estado.Move();

            estado.Redesenha((estado.posX - this.zx) * diffZoom, (estado.posY - this.zy) * diffZoom);
        }

        for (var i = self.estados.length - 1; i >= 0; i--) {
            estado = self.estados[i];
            for (var j = 0; j < estado.transicoes.length; j++) {
                if (estado.transicoes[j].de == estado) {
                    estado.transicoes[j].Redesenha();
                    estado.transicoes[j].distanciaVelha = false;
                }
            }
        }

        this.cross.animate({ 'stroke-opacity': 0 }, 1000);
    }
}

var oDefaults = {
    comando: "criar"
};

Diagrama["toString"] = function () {
    return "Classe de Modelo para Diagrama de Estados\nCriado por Gabriela Silva Ribeiro.";
}

//
Array.prototype.removeByIndex = function (index) {
    this.splice(index, 1);
    //diagrama_selecionados_mudou(diagrama);
}

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function (from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;

    //diagrama_selecionados_mudou(diagrama);

    return this.push.apply(this, rest);
};

// Array clone - By Daricque Tavares(MIT Licensed)
Array.prototype.clone = function () {
    var a = [];
    for (var i = 0; i < this.length; i++) {
        if (this[i].slice && typeof this[i] == 'object') {
            a.push(this[i].clone());
        } else {
            a.push(this[i]);
        }
    }
    return a;
}

//Altera tamanho do array. Caso o array seja maior que o tamanho passado, apenas muda o length. Caso contrário, preenche o array até chegar ao tamanho com o complemento passado.
Array.prototype.AlterarTamanho = function (tamanho, completarCom) {
    this.reverse();
    if (this.length > tamanho)
        this.length = tamanho;
    if (this.length < tamanho)
        this.push.apply(this, novoArrayPreenchido(tamanho - this.length, completarCom));
    return this.reverse();
}

function novoArrayPreenchido(len, val) {
    var a = [];
    while (len--) {
        a.push(val);
    }
    return a;
}

//preenche array com leading zeros
String.prototype.pad = function (tamanho) {
    var self = this;
    while (self.length < tamanho)
        self = '0' + self.toString();
    return self;
}