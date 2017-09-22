'use strict';

/**
 * @ngdoc function
 * @name mobileControlPanelApp.controller:MobileOverviewController
 * @description
 * # MobileOverviewController
 * Controller of the mobileControlPanelApp
 */
angular.module('mobileControlPanelApp').controller('MobileOverviewController', [
  '$scope',
  '$rootScope',
  '$routeParams',
  '$location',
  'DataService',
  'ProjectsService',
  'mcpApi',
  'AuthorizationService',
  function(
    $scope,
    $rootScope,
    $routeParams,
    $location,
    DataService,
    ProjectsService,
    mcpApi,
    AuthorizationService
  ) {
    Object.assign($scope, {
      projectName: $routeParams.project,
      alerts: {},
      renderOptions: Object.assign($scope.renderOptions || {}, {
        hideFilterWidget: true
      }),
      mcpError: false,
      overviews: {
        apps: {},
        services: {}
      }
    });

    ProjectsService.get($routeParams.project)
      .then(projectInfo => {
        const [project = {}, projectContext = {}] = projectInfo;
        $scope.project = project;
        $scope.projectContext = projectContext;

        $scope.overviews.apps = {
          title: 'Mobile Apps',
          text:
            'You can create a Mobile App to enable Mobile Integrations with Mobile Enabled Services',
          actions: [
            {
              label: 'Create Mobile App',
              primary: true,
              modal: true,
              contentUrl: 'extensions/mcp/views/create-mobileapp.html',
              action: function() {
                mcpApi.mobileApps().then(apps => {
                  $scope.overviews.apps.objects = apps;
                  $rootScope.$emit('controlPanelAppModal:hide');
                });
              },
              canView: function() {
                return true;
              }
            }
          ]
        };
        $scope.overviews.services = {
          title: 'Mobile Enabled Services',
          text:
            'You can provision or link a Mobile Enabled Service to enable a Mobile App Integration.',
          actions: [
            {
              label: 'Add External Service',
              modal: true,
              contentUrl: 'extensions/mcp/views/create-service.html',
              action: function() {
                mcpApi.mobileServices().then(services => {
                  $scope.overviews.services.objects = apps;
                  $rootScope.$emit('controlPanelAppModal:hide');
                });
              },
              canView: function() {
                return AuthorizationService.canI(
                  'services',
                  'create',
                  projectContext.projectName
                );
              }
            },
            {
              label: 'Provision Catalog Service',
              primary: true,
              action: $location.path.bind($location, `/`),
              canView: function() {
                return AuthorizationService.canI(
                  'services',
                  'create',
                  projectContext.projectName
                );
              }
            }
          ]
        };

        return Promise.all([
          mcpApi.mobileApps(),
          mcpApi.mobileServices(),
          DataService.list(
            {
              group: 'servicecatalog.k8s.io',
              resource: 'serviceclasses'
            },
            $scope.projectContext
          )
        ]);
      })
      .then(overview => {
        const [apps = [], services = [], serviceClasses] = overview;
        $scope.overviews.apps.objects = apps;
        $scope.overviews.services.objects = services;
        $scope.overviews.services.serviceClasses = serviceClasses['_data'];
      })
      .catch(err => {
        console.error('Error getting overview ', err);
        $scope.mcpError = true;
      });

    $scope.actionSelected = function(object) {
      const ojectIsService = !!object.integrations;
      const actionFn = ojectIsService ? 'deleteService' : 'deleteApp';
      const getFn = ojectIsService ? 'mobileServices' : 'mobileApps';
      const objectType = ojectIsService ? 'services' : 'apps';
      mcpApi[actionFn](object)
        .then(result => {
          return mcpApi[getFn]();
        })
        .then(objects => {
          $scope.overviews[objectType].objects = objects;
        });
    };

    $scope.objectSelected = function(object) {
      const ojectIsService = !!object.integrations;
      if (ojectIsService) {
        $location.path(
          'project/' +
            $routeParams.project +
            '/browse/mobileservices/' +
            object.id
        );
      } else {
        $location.path(
          'project/' + $routeParams.project + '/browse/mobileapps/' + object.id
        );
      }
    };
  }
]);
