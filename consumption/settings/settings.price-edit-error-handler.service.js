module.exports = /*@ngInject*/ function($ionicPopup) {
  function handleError(error) {
    var calcErr = error.calculated_metrics;
    if (calcErr && calcErr.length > 0 && calcErr[0].indexOf('overlap') > 0) {
      return $ionicPopup.alert({
        title: 'Överlappande datum',
        template: 'De angivna datumen överlappar en annan period. Var vänlig och kontrollera att tidigare perioder har ett slutdatum, samt att detta är satt dagen innan den nya periodens start.'
      });
    }

    return $ionicPopup.alert({
      title: 'Datafel',
      template: 'Servern godtar inte de angivna priserna. Kontroller att du inte fått med några bokstäver eller annat av misstag.'
    });
  }

  return {
    handleError: handleError
  };
};
