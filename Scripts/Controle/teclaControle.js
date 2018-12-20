/// <reference path="../Modelo/diagrama.js" />
/// <reference path="../Modelo/estado.js" />
/// <reference path="../jquery-1.6.1-vsdoc.js" />
/// <reference path="../raphael.js" />
/// <reference path="../jquery-ui-1.8.13.js" />
/// <reference path="../index.js" />

$(function () {
    $(document).keydown(function (e) {
        if (e.altKey)
            switch (e.which) {
            case 78: //Alt+N
                $('#novo').click();
                break;
        } else if (e.ctrlKey) {
            switch (e.which) {
                case 83: //ctrl+s
                    $('#exportar').click();
                    return false;
                case 68: //crtl+d
                    $('#deterministica').click();
                    return false;
                case 90: //ctrl+z
                    diagramaPrincipal.timeline.Voltar();
                    return false;
                case 89: //ctrl+y
                    diagramaPrincipal.timeline.Avancar();
                    return false;
                case 65: //ctrl+a
                    diagramaPrincipal.SelecionarTodos();
                    return false;
            }
        }
    })
               .keyup(function (e) {
                   if(exibirLog4213) console.log('document keyup: ' + e.which);
                   //ImprimePropriedades(e);
                   if (!e.altKey && !e.ctrlKey)
                       switch (e.which) {
                       case 27: //ESC
                           diagramaPrincipal.DeselecionarTodos();
                           break;
                       case 46: //DELETE
                           var r = diagramaPrincipal.selecionados.length;
                           diagramaPrincipal.RemoverEstado(diagramaPrincipal.selecionados);
                           if(r) diagramaPrincipal.timeline.Salvar('delete');
                           break;
                       case 69: //E
                           $('#criar').click();
                           break;
                       case 84: //T
                           $('#transicao').click();
                           break;
                       case 83: //S
                           $('#selecionar').click();
                           break;
                       case 77: //M
                           $('#animacao').click();
                           break;
                       case 65: //A
                           $('#arrastar').click();
                           break;
                   }
               })
               .click(function (e) {
                   ExportarShow(false);
                   ImportarShow(false);
               });
});