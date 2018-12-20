/// <reference path="transicaoControle.js" />
/// <reference path="teclaControle.js" />
/// <reference path="diagramaControle.js" />
/// <reference path="estadoControle.js" />
/// <reference path="mapaTransicaoControle.js" />
/// <reference path="opcaoControle.js" />
/// <reference path="simulacaoControle.js" />
/// <reference path="sinteseControle.js" />
/// <reference path="tabelaExcitacaoControle.js" />
/// <reference path="../Modelo/transicao.js" />
/// <reference path="../Modelo/menu.js" />
/// <reference path="../Modelo/diagrama.js" />
/// <reference path="../Modelo/estado.js" />
/// <reference path="../jquery-1.6.2-vsdoc.js" />
/// <reference path="../jquery-ui-1.8.14.js" />
/// <reference path="../json2.js" />

var Timeline = function (diagrama) {
    var timeStep = -1;
    var self = this;

    this.ativo = true;
    this.timeline = [];
    this.diagrama = diagrama;

    this.Salvar = function (donde) {
        //var obj = self.diagrama.Exportar();
        if (self.ativo) {
            if(exibirLog4213) console.log(donde + ': Salvando.. ' + (timeStep + 1) + ' Ativo: ' + self.ativo);
            self.timeline[++timeStep] = self.diagrama.Exportar();
            //if (typeof self.timeline[timeStep] == 'undefined') debugger;
            if (donde) self.timeline[timeStep].donde = donde;
            if ((self.timeline.length - 1) != timeStep) self.timeline.length = timeStep + 1;
            if (localStorage) localStorage['orangecad'] = JSON.stringify(self.timeline[timeStep]);
        }
        //delete obj;

        return self;
    }

    this.Voltar = function () {
        self.ativo = false;
        if (timeStep) ImportarCore(self.timeline[--timeStep]);
        if(exibirLog4213) console.log(self.timeline[timeStep]);
        if (localStorage) localStorage['orangecad'] = JSON.stringify(self.timeline[timeStep]);
        self.ativo = true;
        if(exibirLog4213) console.log(timeStep);
        return self;
    }

    this.Avancar = function () {
        self.ativo = false;
        if (self.timeline[timeStep + 1]) ImportarCore(self.timeline[++timeStep]);
        if(exibirLog4213) console.log(self.timeline[timeStep]);
        if (localStorage) localStorage['orangecad'] = JSON.stringify(self.timeline[timeStep]);
        self.ativo = true;
        if(exibirLog4213) console.log(timeStep);
        return self;
    }

    this.UltimoSave = function () {
        return self.timeline[timeStep];
    }

    this.Limpar = function () {
        timeStep = -1;
        self.timeline.length = 0;

        return self;
    }

    this.Ativo = function (ativado) {
        self.ativo = ativado || false;
        return self;
    }
};

$(function () {
    diagramaPrincipal.timeline = new Timeline(diagramaPrincipal);
    if (localStorage) {
        if (localStorage['orangecad']) {
            //ImportarCore(localStorage['orangecad']);
            $('#importarArea').val(localStorage['orangecad']);

            diagramaPrincipal.timeline.Salvar('vazio');
            diagramaPrincipal.timeline.Ativo(false);
            
            Importar(true);
            //$('#importarArea').val('');

            diagramaPrincipal.timeline.Ativo(true);
            diagramaPrincipal.timeline.Salvar('loaded');
        }
    }
    //setTimeout('diagramaPrincipal.timeline.Salvar();', 500);
});

