angular
  .module('eresto.shared', [])
  .directive('numberValidation', numberValidation)

function numberValidation(){
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, modelCtrl) {
      modelCtrl.$parsers.push(function (inputValue) {
        var transformedInput = inputValue.toLowerCase().replace(/ /g, ''); 
        if (transformedInput!=inputValue) {
          modelCtrl.$setViewValue(transformedInput);
          modelCtrl.$render();
        }         
        return transformedInput;         
      });
    }
  };
}