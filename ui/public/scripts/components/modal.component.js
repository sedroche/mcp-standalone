'use strict';

/**
 * @ngdoc component
 * @name mcp.directive:modal
 * @description
 * # modal
 */
angular.module('mobileControlPanelApp').directive('modal', function() {
  return {
    template: `<div class="controlPanelAppModal">
                <button class="btn btn-primary launch">{{launch}}</button>
                <div class="modal container" tabindex="-1" role="dialog" aria-labelledby="update this" aria-hidden="true">
                  <div class="modal-dialog">
                    <div class="modal-content">
                      <div class="modal-header">
                        <button type="button" class="close icon" aria-hidden="true">
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
      displayControls: '=?',
      modalOpen: '=?',
      launch: '=?',
      modalTitle: '=?',
      cancel: '&?',
      ok: '&'
    },
    transclude: true,
    link: function(scope, element, attrs, controller, transcludeFn) {
      const launchButton = $('.btn.btn-primary.launch', element);
      const okButton = $('.btn.btn-primary.ok', element);
      const cancelButton = $('.btn.btn-primary.cancel', element);
      const closeIcon = $('.close.icon', element);

      scope.modal = $('.modal.container', element).modal({
        show: false,
        keyboard: true
      });

      launchButton.on('click', event => {
        scope.modalOpen = true;
        scope.$apply(function() {});
      });

      okButton.on('click', event => {
        scope.ok && scope.ok()();
        scope.modalOpen = false;
        scope.$apply(function() {});
      });

      cancelButton.on('click', event => {
        scope.cancel && scope.cancel()();
        scope.modalOpen = false;
        scope.$apply(function() {});
      });

      closeIcon.on('click', event => {
        scope.cancel && scope.cancel()();
        scope.modalOpen = false;
        scope.$apply(function() {});
      });

      scope.modal.on('hidden.bs.modal', function(e) {
        if (!scope.modalOpen) {
          return;
        }

        scope.modalOpen = false;
        scope.$apply(function() {});
      });

      scope.modalOpen = scope.modalOpen || false;
      scope.$watch('modalOpen', value => {
        if (value) {
          scope.modal.modal('show');
        } else {
          scope.modal.modal('hide');
        }
      });
    }
  };
});
