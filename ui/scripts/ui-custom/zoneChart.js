(function($, cloudStack) {
  /**
   * Zone details chart
   */
  cloudStack.uiCustom.systemChart = function(chartID) {
    /**
     * Make view all button
     */
    var viewAllButton = function(args) {
      var $viewAll = $('<div>').addClass('button view-all');
      var $label = $('<span>').addClass('view-all-label').html('View all');
      var $browser = args.$browser;
      var action = args.action;

      // Launch a list view
      $viewAll.click(function() {
        $browser.cloudBrowser('addPanel', {
          title: args.title,
          maximizeIfSelected: true,
          complete: function($newPanel) {
            action({ $panel: $newPanel });
          }
        });
      });

      $viewAll.append($label);

      return $viewAll;
    };

    /**
     * Chart button action generators
     */
    var actions = {
      /**
       * Makes a list view from given zone sub-section
       */
      listView: function(targetID, context) {
        return function(args) {
          var $elem = args.$panel;
          var listViewArgs = cloudStack.sections.system.subsections[targetID].listView;

          $elem.listView({
            context: context,
            listView: listViewArgs
          });
        };
      },

      providerListView: function(context) {
        return function(args) {
          var $elem = args.$panel;
          var listViewArgs = cloudStack.sections.system.naas.providerListView;

          $elem.listView({
            context: context,
            listView: $.extend(true, {}, listViewArgs, {
              detailView: cloudStack.sections.system.naas.networkProviders.types.netscaler
            })
          });
        };
      },

      /**
       * Makes details for a given traffic type
       */
      trafficTypeDetails: function(targetID, context) {
        return function(args) {
          var $elem = args.$panel;
          var detailViewArgs = cloudStack.sections.system.naas.mainNetworks[targetID].detailView;

          $elem.detailView($.extend(true, {}, detailViewArgs, {
            $browser: $('#browser .container'),
            context: context
          }));
        };
      }
    };

    /**
     * Chart generators
     */
    var charts = {
      /**
       * Compute tab
       */
      compute: function(args) {
        var $chart = $('<div>');
        var $browser = $('#browser .container');
        var context = args.context;

        // Resource items
        var computeResources = {
          zone: {
            label: 'Zone'
          },

          pods: {
            label: 'Pods',
            viewAll: {
              action: actions.listView('pods', context),
            }
          },

          clusters: {
            label: 'Clusters',
            viewAll: {
              action: actions.listView('clusters', context),
            }
          },

          hosts: {
            label: 'Hosts',
            viewAll: {
              action: actions.listView('hosts', context),
            }
         },

          primaryStorage: {
            label: 'Primary Storage',
            viewAll: {
              action: actions.listView('primary-storage', context),
            }
          },

          secondaryStorage: {
            label: 'Secondary Storage',
            viewAll: {
              action: actions.listView('secondary-storage', context),
            }
          }
        };


        var $computeResources = $('<ul>').addClass('resources');

        // Make resource items
        $.each(computeResources, function(id, resource) {
          var $li = $('<li>');
          var $label = $('<span>').addClass('label');

          $li.addClass(id);
          $label.html(resource.label);
          $label.appendTo($li);

          // View all
          if (resource.viewAll) {
            viewAllButton($.extend(resource.viewAll, {
              title: resource.label,
              $browser: $browser,
              context: context
            })).appendTo($li);
          }

          $li.appendTo($computeResources);
        });

        $chart.append($computeResources);

        return $chart;
      },

      network: function(args) {
        var $chart = $('<div>');
        var $browser = $('#browser .container');
        var $loading = $('<div>').addClass('loading-overlay');
        var context = args.context;
        var networkDataProvider = cloudStack.sections.system.naas.networks.dataProvider;
        var trafficTypeDataProvider = cloudStack.sections.system.naas.trafficTypes.dataProvider;

        $loading.appendTo($chart);

        var renderChart = function(args) {
          var $targetChart = args.$chart ? args.$chart : $chart;
          
          // Get traffic type data
          trafficTypeDataProvider({
            context: $.extend(true, {}, context, {
              physicalNetworks: [args.data]
            }),
            response: {
              success: function(args) {
                var $networkChart = $('<div>').addClass('system-network-chart');
                var $trafficTypes = $('<ul>').addClass('resources traffic-types');

                $loading.remove();

                var trafficTypes = {
                  'public': {
                    label: 'Public',
                    configure: {
                      action: actions.trafficTypeDetails('public', context)
                    }
                  },

                  'guest': {
                    label: 'Guest',
                    configure: {
                      action: actions.trafficTypeDetails('guest', context)
                    }
                  },

                  'management': {
                    label: 'Management',
                    configure: {
                      action: actions.trafficTypeDetails('management', context)
                    }
                  },

                  'storage': {
                    label: 'Storage',
                    configure: {
                      action: function() {}
                    }
                  },

                  'providers': {
                    label: 'Network Service Providers',
                    ignoreChart: true,
                    configure: {
                      action: actions.providerListView(context)
                    }
                  }
                };

                var validTrafficTypes = $.map(args.data, function(trafficType) {
                  return trafficType.name.toLowerCase();
                });

                // Make traffic type elems
                $.each(trafficTypes, function(id, trafficType) {
                  if ($.inArray(id, validTrafficTypes) == -1 && !trafficType.ignoreChart) return true;
                  
                  // Make list item
                  var $li = $('<li>').addClass(id);
                  var $label = $('<span>').addClass('label').html(trafficType.label);
                  var $configureButton = viewAllButton($.extend(trafficType.configure, {
                    title: trafficType.label,
                    $browser: $browser,
                    context: context
                  }));

                  $li.append($label, $configureButton);
                  $li.appendTo($trafficTypes);

                  // Make chart
                  if (trafficType.ignoreChart) return true;

                  var $targetChartItem = $('<div>').addClass('network-chart-item').addClass(id);
                  $targetChartItem.appendTo($networkChart);
                });

                var $switchIcon = $('<div>').addClass('network-switch-icon').append(
                  $('<span>').html('L2/L3 switch')
                );
                var $circleIcon = $('<div>').addClass('base-circle-icon');

                $targetChart.append($trafficTypes, $switchIcon, $networkChart, $circleIcon);   
              }
            }
          });
        };

        // Get network data
        networkDataProvider({
          context: context,
          response: {
            success: function(args) {
              var data = args.data;
              if (data.length > 1) {
                // Render list view first
                $chart.listView({
                  listView: $.extend(true, {}, cloudStack.sections.system.naas.networks.listView, {
                    dataProvider: function(args) {
                      args.response.success({ data: data });
                    },
                    detailView: {
                      tabs: {
                        network: {
                          title: 'Network',
                          custom: function(args) {
                            var $chart = $('<div>').addClass('system-chart network');
                            
                            renderChart({
                              $chart: $chart,
                              data: args.context.physicalNetworks[0]
                            });

                            return $chart;
                          }
                        }
                      }
                    }
                  })
                });
                $loading.remove();
              } else {
                renderChart(args);
              }
            }
          }
        });

        return $chart;
      },

      resources: function(args) {
        var $chart = $('<div>').html('Resources');

        return $chart;
      }
    };

    return function(args) {
      // Fix zone context naming
      args.context.zones = args.context.physicalResources;

      var $chart = charts[chartID](args).addClass('system-chart').addClass(chartID);

      return $chart;
    };
  };
})(jQuery, cloudStack);
