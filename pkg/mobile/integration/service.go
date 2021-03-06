package integration

import (
	"fmt"

	"github.com/feedhenry/mcp-standalone/pkg/mobile"
	"github.com/pkg/errors"
	kerror "k8s.io/apimachinery/pkg/api/errors"
)

// MobileService holds the business logic for dealing with the mobile services and integrations with those services
type MobileService struct {
	namespace string
}

func NewMobileSevice(ns string) *MobileService {
	return &MobileService{
		namespace: ns,
	}
}

//FindByNames will return all services with a name that matches the provided name
func (ms *MobileService) FindByNames(names []string, serviceCruder mobile.ServiceCruder) ([]*mobile.Service, error) {
	svc, err := serviceCruder.List(ms.filterServices(names))
	if err != nil {
		return nil, errors.Wrap(err, "Attempting to discover mobile services.")
	}
	return svc, nil
}

// TODO move to the secret data read when discovering the services
var capabilities = map[string]map[string][]string{
	"fh-sync-server": map[string][]string{
		"capabilities": {"data storage, data syncronisation"},
		"integrations": {"keycloak"},
	},
	"keycloak": map[string][]string{
		"capabilities": {"authentication, authorisation"},
		"integrations": {"fh-sync"},
	},
	"custom": map[string][]string{
		"capabilities": {""},
		"integrations": {""},
	},
}

var serviceTypes = []string{"fh-sync-server", "keycloak", "custom"}

// DiscoverMobileServices will discover mobile services configured in the current namespace
func (ms *MobileService) DiscoverMobileServices(serviceCruder mobile.ServiceCruder) ([]*mobile.Service, error) {
	//todo move to config

	svc, err := serviceCruder.List(ms.filterServices(serviceTypes))
	if err != nil {
		return nil, errors.Wrap(err, "Attempting to discover mobile services.")
	}
	for _, s := range svc {
		s.Capabilities = capabilities[s.Name]
	}
	return svc, nil
}

// ReadMoileServiceAndIntegrations read servuce and any available service it can integrate with
func (ms *MobileService) ReadMoileServiceAndIntegrations(serviceCruder mobile.ServiceCruder, name string) (*mobile.Service, error) {
	//todo move to config
	svc, err := serviceCruder.Read(name)
	if err != nil {
		return nil, errors.Wrap(err, "Attempting to discover mobile services.")
	}
	svc.Capabilities = capabilities[svc.Name]
	if svc.Capabilities != nil {
		integrations := svc.Capabilities["integrations"]
		for _, v := range integrations {
			isvs, err := serviceCruder.List(ms.filterServices([]string{v}))
			if err != nil && !kerror.IsNotFound(err) {
				return nil, errors.Wrap(err, "failed attempting to discover mobile services.")
			}
			if len(isvs) != 0 {
				is := isvs[0]
				fmt.Println("svc label is ", is.Name, svc.Labels[is.Name])
				enabled := svc.Labels[is.Name] == "true"
				svc.Integrations[v] = &mobile.ServiceIntegration{
					ComponentSecret: svc.ID,
					Component:       svc.Name,
					Namespace:       ms.namespace,
					Service:         is.ID,
					Enabled:         enabled,
				}
			}
		}
	}
	return svc, nil
}

func (ms *MobileService) filterServices(serviceTypes []string) func(att mobile.Attributer) bool {
	return func(att mobile.Attributer) bool {
		for _, sn := range serviceTypes {
			if sn == att.GetType() {
				return true
			}
		}
		return false
	}
}

// GenerateMobileServiceConfigs will return a map of services and their mobile configs
func (ms *MobileService) GenerateMobileServiceConfigs(serviceCruder mobile.ServiceCruder) (map[string]*mobile.ServiceConfig, error) {
	svcConfigs, err := serviceCruder.ListConfigs(ms.filterServices(serviceTypes))
	if err != nil {
		return nil, errors.Wrap(err, "GenerateMobileServiceConfigs failed during a list of configs")
	}
	configs := map[string]*mobile.ServiceConfig{}
	for _, sc := range svcConfigs {
		configs[sc.Name] = sc
	}
	return configs, nil
}

//MountSecretForComponent will mount secret into component, returning any errors
func (ms *MobileService) MountSecretForComponent(svcCruder mobile.ServiceCruder, mounter mobile.VolumeMounter, clientService, serviceSecret string) error {
	//check secret exists and store for later update
	service, err := svcCruder.Read("keycloak-public-client")
	if err != nil {
		return errors.Wrap(err, "failed to find secret: '"+serviceSecret+"'")
	}

	err = mounter.Mount(serviceSecret, clientService)
	if err != nil {
		return errors.Wrap(err, "failed to mount secret '"+serviceSecret+"' into service '"+clientService+"'")
	}

	//find the clientService secret name
	css, err := svcCruder.List(ms.filterServices([]string{clientService}))
	if err != nil || len(css) == 0 {
		return errors.New("failed to find secret for client service: '" + clientService + "'")
	}
	clientServiceSecret := css[0].ID

	//update secret with integration enabled
	enabled := map[string]string{service.Name: "true"}
	if err := svcCruder.UpdateEnabledIntegrations(clientServiceSecret, enabled); err != nil {
		return errors.Wrap(err, "failed to update enabled services after mounting secret")
	}

	return nil
}

//UnmountSecretInComponent will unmount secret from component, so it can be no longer use serviceName, returning any errors
func (ms *MobileService) UnmountSecretInComponent(svcCruder mobile.ServiceCruder, unmounter mobile.VolumeUnmounter, clientService, serviceSecret string) error {
	//check secret exists and store for later update
	service, err := svcCruder.Read(serviceSecret)
	if err != nil {
		return errors.Wrap(err, "failed to find secret: '"+serviceSecret+"'")
	}

	err = unmounter.Unmount(serviceSecret, clientService)
	if err != nil {
		return errors.Wrap(err, "failed to unmount secret '"+serviceSecret+"' from component '"+clientService+"'")
	}

	//find the clientService secret name
	css, err := svcCruder.List(ms.filterServices([]string{clientService}))
	if err != nil || len(css) == 0 {
		return errors.New("failed to find secret for client service: '" + clientService + "'")
	}
	clientServiceSecret := css[0].ID

	//update secret with integration enabled
	disabled := map[string]string{service.Name: "false"}
	if err := svcCruder.UpdateEnabledIntegrations(clientServiceSecret, disabled); err != nil {
		return errors.Wrap(err, "failed to update enabled services after unmounting secret")
	}

	return nil

	return nil
}
