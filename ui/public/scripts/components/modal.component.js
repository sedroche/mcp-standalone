'use strict';

/**
 * @ngdoc component
 * @name mcp.component:modal
 * @description
 * # modal
 */
// angular.module('mobileControlPanelApp').directive('modal', {
//   template: `<button class="btn btn-default" data-toggle="modal" data-target="#myModal">{{$ctrl.launch}}</button>
//               <div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
//                 <div class="modal-dialog">
//                   <div class="modal-content">
//                     <div class="modal-header">
//                       <button type="button" class="close" data-dismiss="modal" aria-hidden="true">
//                         <span class="pficon pficon-close"></span>
//                       </button>
//                       <h4 class="modal-title" id="myModalLabel">{{$ctrl.modalTitle}}</h4>
//                     </div>
//                     <div class="modal-body">
//                       <div ng-include="$ctrl.contentUrl"></div>
//                     </div>
//                     <div class="modal-footer">
//                       <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
//                       <button type="button" class="btn btn-primary">Create</button>
//                     </div>
//                   </div>
//                 </div>
//               </div>`,
//   bindings: {
//     modalTitle: '<',
//     launch: '<',
//     contentUrl: '<'
//   },
//   controller: ['$scope', function($scope) {}]
// });
angular.module('mobileControlPanelApp').directive('modal', function() {
  return {
    template: `<div class="controlPanelAppModal">
                <button class="btn btn-primary launch">{{launch}}</button>
                <div class="modal container" tabindex="-1" role="dialog" aria-labelledby="update this" aria-hidden="true">
                  <div class="modal-dialog">
                    <div class="modal-content">
                      <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">
                          <span class="pficon pficon-close"></span>
                        </button>
                        <h4 class="modal-title">{{modalTitle}}</h4>
                      </div>
                      <div class="modal-body">
                        <ng-transclude></ng-transclude>
                      </div>
                      <div ng-if="displayControls === undefined || displayControls === true" class="modal-footer">
                        <button type="button" class="btn btn-default cancel">Cancel</button>
                        <button type="button" class="btn btn-primary ok">Create</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>`,
    scope: {
      displayControls: '=',
      launch: '=',
      modalTitle: '=',
      cancel: '&',
      ok: '&'
    },
    transclude: true,
    controller: function($scope, $rootScope) {
      $rootScope.$on('controlPanelAppModal:hide', function() {
        $scope.modal && $scope.modal.modal('hide');
      });
    },
    link: function(scope, element, attrs, controller, transcludeFn) {
      console.log(scope);
      const launchButton = $('.btn.btn-primary.launch', element);
      const okButton = $('.btn.btn-primary.ok', element);
      const cancelButton = $('.btn.btn-primary.cancel', element);
      scope.modal = $('.modal.container', element).modal({
        show: false,
        keyboard: true
      });

      launchButton.on('click', event => {
        scope.modal.modal('show');
      });

      okButton.on('click', event => {
        scope.ok && scope.ok()();
        scope.modal.modal('hide');
      });

      cancelButton.on('click', event => {
        scope.scope.cancel && scope.cancel()();
        modal.modal('hide');
      });
    }
  };
});

//TODO
// return {
//   templateUrl: function(elem, attr) {
//     return 'customer-' + attr.type + '.html';
//   }
// };
