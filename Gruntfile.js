module.exports = function(grunt){
var pkg = grunt.file.readJSON('package.json');
grunt.initConfig({
    concat: {
		// for forcemode2/3
        home_core: {
			files:{
				'dist_develop/d6home_core.js' :
				[	
					'd6/d6facade.js',
					'd6/areaset/*.js',
					'd6/base/objectcreate.js',
					'd6/base/energy.js',
					'd6/base/consbase.js',
					'd6/base/measurebase.js',
					'd6/base/doc.js',
					'd6/base/d6.js',
					'd6/base/base64.js',
					'd6/base/d6_calcmonthly.js',
					'd6/base/d6_get.js',
					'd6/base/d6_getinput.js',
					'd6/base/d6_getmeasure.js',
					'd6/base/d6_getdemand.js',
					'd6/base/d6_getevaluateaxis.js',
					'd6/base/d6_construct.js',
					'd6/base/d6_calccons.js',
					'd6/base/d6_calcaverage.js',
					'd6/base/d6_calcmeasures.js',
					'd6/base/d6_setvalue.js',
					'd6/base/d6_tools.js',
					'd6/home/scenarioset.js',
					'd6/home/scenariofix.js',
					'd6/home/consEnergy.js',
					'd6/home/consSeason.js',
					'd6/home/consTOTAL.js',
					'd6/home/consHWsum.js',
					'd6/home/consHWshower.js',
					'd6/home/consHWtub.js',
					'd6/home/consHWdresser.js',
					'd6/home/consHWdishwash.js',
					'd6/home/consHWtoilet.js',
					'd6/home/consCOsum.js',
					'd6/home/consACcool.js',
					'd6/home/consHTsum.js',
					'd6/home/consHTcold.js',
					'd6/home/consACheat.js',
					'd6/home/consAC.js',
					'd6/home/consRFsum.js',
					'd6/home/consRF.js',
					'd6/home/consLIsum.js',
					'd6/home/consLI.js',
					'd6/home/consTVsum.js',
					'd6/home/consTV.js',
					'd6/home/consDRsum.js',
					'd6/home/consCRsum.js',
					'd6/home/consCR.js',
					'd6/home/consCRtrip.js',
					'd6/home/consCKsum.js',
					'd6/home/consCKpot.js',
					'd6/home/consCKrice.js',
					'd6/home/consCKcook.js',
				]
			}
        },
        office_core: {
			files:{
				'dist_develop/d6office_core.js' :
				[	
					'd6/d6facade.js',
					'd6/areaset/*.js',
					'd6/base/objectcreate.js',
					'd6/base/energy.js',
					'd6/base/consbase.js',
					'd6/base/measurebase.js',
					'd6/base/doc.js',
					'd6/base/d6.js',
					'd6/base/base64.js',
					'd6/base/d6_calcmonthly.js',
					'd6/base/d6_get.js',
					'd6/base/d6_getinput.js',
					'd6/base/d6_getmeasure.js',
					'd6/base/d6_getdemand.js',
					'd6/base/d6_getevaluateaxis.js',
					'd6/base/d6_construct.js',
					'd6/base/d6_calccons.js',
					'd6/base/d6_calcaverage.js',
					'd6/base/d6_calcmeasures.js',
					'd6/base/d6_setvalue.js',
					'd6/base/d6_tools.js',
					'd6/office/scenarioset.js',
					'd6/office/scenariofix.js',
					'd6/office/consEnergy.js',
					'd6/office/consMonth.js',
					'd6/office/consSeason.js',
					'd6/office/consTOTAL.js',
					'd6/office/consRM.js',
					'd6/office/consHWsum.js',
					'd6/office/consCOsum.js',
					'd6/office/consCO.js',
					'd6/office/consHTsum.js',
					'd6/office/consHT.js',
					'd6/office/consACsum.js',
					'd6/office/consAC.js',
					'd6/office/consRFsum.js',
					'd6/office/consRF.js',
					'd6/office/consLIsum.js',
					'd6/office/consLI.js',
					'd6/office/consTVsum.js',
					'd6/office/consTV.js',
					'd6/office/consOAsum.js',
					'd6/office/consOTsum.js',
					'd6/office/consOT.js',
					'd6/office/consCRsum.js',
					'd6/office/consCR.js',
					'd6/office/consCRtrip.js',
					'd6/office/consCKsum.js',
				]
			}
        },
        home_JP: {
			files:{
				'dist_develop/d6home_JP.js' :
				[	'localize_JP/areaset/*.js',
					'localize_JP/home/*.js'
				]
			}
        },
        office_JP: {
			files:{
				'dist_develop/d6office_JP.js' :
				[	'localize_JP/areaset/*.js',
					'localize_JP/office/*.js'
				]
			}
        },
        home_JP_en: {
			files:{
				'dist_develop/d6home_JP_en.js' :
				[	'localize_JP_en/areaset/*.js',
					'localize_JP_en/home/*.js'
				]
			}
        },
        office_JP_en: {
			files:{
				'dist_develop/d6office_JP_en.js' :
				[	'localize_JP_en/areaset/*.js',
					'localize_JP_en/office/*.js'
				]
			}
        },
        home_CN: {
			files:{
				'dist_develop/d6home_CN.js' :
				[	'localize_CN/areaset/*.js',
					'localize_CN/home/*.js'
				]
			}
        },
        office_CN: {
			files:{
				'dist_develop/d6office_CN.js' :
				[	'localize_CN/areaset/*.js',
					'localize_CN/office/*.js'
				]
			}
        },
        home_FR: {
			files:{
				'dist_develop/d6home_FR.js' :
				[	'localize_FR/areaset/*.js',
					'localize_FR/home/*.js'
				]
			}
        },
        office_FR: {
			files:{
				'dist_develop/d6office_FR.js' :
				[	'localize_FR/areaset/*.js',
					'localize_FR/office/*.js'
				]
			}
        },
        home_KR: {
			files:{
				'dist_develop/d6home_KR.js' :
				[	'localize_KR/areaset/*.js',
					'localize_KR/home/*.js'
				]
			}
        },
        office_KR: {
			files:{
				'dist_develop/d6office_KR.js' :
				[	'localize_KR/areaset/*.js',
					'localize_KR/office/*.js'
				]
			}
        },
    },

    uglify: {
		home_core : {
			files:{
                // output file : source file
                'dist/d6home_core.min.js': 'dist_develop/d6home_core.js'
			}
		},
		office_core : {
			files:{
                'dist/d6office_core.min.js': 'dist_develop/d6office_core.js'
			}
		},
		home_JP : {
			files:{
                // output file : source file
                'dist/d6home_JP.min.js': 'dist_develop/d6home_JP.js'
			}
		},
		office_JP : {
			files:{
                // output file : source file
                'dist/d6office_JP.min.js': 'dist_develop/d6office_JP.js'
			}
		},
		home_JP_en : {
			files:{
                // output file : source file
                'dist/d6home_JP_en.min.js': 'dist_develop/d6home_JP_en.js'
			}
		},
		office_JP_en : {
			files:{
                // output file : source file
                'dist/d6office_JP_en.min.js': 'dist_develop/d6office_JP_en.js'
			}
		},
		home_CN : {
			files:{
                // output file : source file
                'dist/d6home_CN.min.js': 'dist_develop/d6home_CN.js'
			}
		},
		office_CN : {
			files:{
                // output file : source file
                'dist/d6office_CN.min.js': 'dist_develop/d6office_CN.js'
			}
		},
		home_FR : {
			files:{
                // output file : source file
                'dist/d6home_FR.min.js': 'dist_develop/d6home_FR.js'
			}
		},
		office_FR : {
			files:{
                // output file : source file
                'dist/d6office_FR.min.js': 'dist_develop/d6office_FR.js'
			}
		},
		home_KR : {
			files:{
                // output file : source file
                'dist/d6home_KR.min.js': 'dist_develop/d6home_KR.js'
			}
		},
		office_KR : {
			files:{
                // output file : source file
                'dist/d6office_KR.min.js': 'dist_develop/d6office_KR.js'
			}
		},
    },
});

grunt.loadNpmTasks('grunt-contrib-concat');
grunt.loadNpmTasks('grunt-contrib-uglify');
grunt.registerTask('core', ['concat:home_core',
							'concat:office_core',
							'uglify:home_core',
							'uglify:office_core'
							]);
grunt.registerTask('default', ['concat','uglify']);

};
