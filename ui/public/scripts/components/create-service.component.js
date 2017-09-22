'use strict';

/**
 * @ngdoc component
 * @name mcp.component:create-service
 * @description
 * # createService
 */
angular.module('mobileControlPanelApp').component('createService', {
  template: `                <div class="container-fluid">
                    <div class="form-group">
                        <label for="sel1">Select A Service Type:</label>
                        <select ng-model='externalService.type' class="form-control" id="sel1">
                                  <option value="">---Please select---</option>
                                  <option value="fh-sync-server">fh-sync-server</option>
                                  <option value="keycloak">keycloak</option>
                                  <option value="custom">custom</option>
                                </select>
                    </div>
                    <div ng-if="externalService.type == 'fh-sync-server'">
                        <form>

                            <div class="form-group">
                                <label for="host">Sync Server Host</label>
                                <input type="text" ng-model="externalService.host" class="form-control" id="host" placeholder="https://somesync-server.com">
                            </div>
                            <div class="form-group">
                                <label for="id">Sync Server Id</label>
                                <input type="text" ng-model="externalService.name" class="form-control" id="id" placeholder="something you will recognise">
                                <span class="help-block">A unique name/id you will recognise.</span>
                            </div>
                            <div class="form-group">
                                <label for="id">Namespace</label>
                                <select ng-model='externalService.namespace' class="form-control" id="sel1">
                                    <option value="">---Please select---</option>
                                    <option value="">None</option>
                                    <option ng-repeat="project in projects" value="{{project.metadata.name}}">{{project.metadata.name}}</option>
                                </select>
                                <span class="help-block">Select Only if your service is provisioned to a namespace/project. Otherwise leave empty. </span>
                            </div>
                            <div class="form-group">
                                <label for="host">Custom Config Parameters (optional)</label>
                                <key-value-editor entries="customFields"></key-value-editor>
                            </div>
                            <button type="submit" ng-click="addService()" class="btn btn-default">Submit</button>
                        </form>
                    </div>
                    <div ng-if="externalService.type == 'keycloak'">
                        <form>
                            <div class="form-group">
                                <label for="host">Keycloak Server Host</label>
                                <input type="text" ng-model="externalService.host" class="form-control" id="host" placeholder="https://somesync-server.com">
                            </div>
                            <div class="form-group">
                                <label for="id">Keycloak Server Id</label>
                                <input type="text" ng-model="externalService.name" class="form-control" id="id" placeholder="something you will recognise">
                                <span class="help-block">A unique name/id you will recognise.</span>
                            </div>
                            <div class="form-group">
                                <label for="id">Namespace</label>
                                <select ng-model='externalService.namespace' class="form-control" id="sel1">
                                    <option value="">---Please select---</option>
                                    <option value="">None</option>
                                    <option ng-repeat="project in projects" value="{{project.metadata.name}}">{{project.metadata.name}}</option>
                                </select>
                                <span class="help-block">Select Only if your service is provisioned to a namespace/project. Otherwise leave empty. </span>
                            </div>
                            <div class="form-group">
                                <label for="publicClient">Public client (Json) </label>
                                <textarea class="form-control rows=" 20 " ng-model="externalService.params.installPublic "></textarea>
                                <span class="help-block "><a href="http://www.keycloak.org/docs/3.3/server_admin/topics/clients/client-oidc.html ">Client Management in Keycloak</a></span>   
                            </div>
                            <div class="form-group ">
                                <label for="id ">Bearer client (Json) </label>
                                <textarea class="form-control rows="20" ng-model="externalService.params.installBearer"></textarea>
                                <span class="help-block"><a href="http://www.keycloak.org/docs/3.3/server_admin/topics/clients/client-oidc.html">Client Management in Keycloak</a></span>
                            </div>
                            <div class="form-group">
                                <label for="host">Custom Config Parameters (optional)</label>
                                <key-value-editor entries="customFields"></key-value-editor>
                            </div>
                            <button type="submit" ng-click="addService()" class="btn btn-default">Submit</button>
                        </form>
                    </div>
                    <!-- custom external service -->
                    <div ng-if="externalService.type == 'custom'">
                        <form>
                            <div class="form-group">
                                <label for="id">Service Name</label>
                                <input type="text" ng-model="externalService.name" class="form-control" id="id" placeholder="the name of your service">
                                <span class="help-block">A name for your service.</span>
                            </div>
                            <div class="form-group">
                                <label for="host">Custom Service Host</label>
                                <input type="text" ng-model="externalService.host" class="form-control" id="host" placeholder="https://somesync-server.com">
                            </div>
                            <div class="form-group">
                                <label for="id">Namespace</label>
                                <select ng-model='externalService.namespace' class="form-control" id="sel1">
                                    <option value="">---Please select---</option>
                                    <option value="">None</option>
                                    <option ng-repeat="project in projects" value="{{project.metadata.name}}">{{project.metadata.name}}</option>
                                </select>
                                <span class="help-block">Select Only if your service is provisioned to a namespace/project. Otherwise leave empty. </span>
                            </div>
                            <div class="form-group">
                                <label for="host">Custom Config Parameters (optional)</label>
                                <key-value-editor entries="customFields"></key-value-editor>
                            </div>
                            <button type="submit" ng-click="addService()" class="btn btn-default">Submit</button>
                        </form>
                    </div>`,
  bindings: {
    model: '=',
    created: '&'
  },
  controller: ['$scope', function($scope) {}]
});
