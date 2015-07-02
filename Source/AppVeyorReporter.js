function AppVeyorReporter(runner) {
  var tests = []

  function mapTest(test) {
    return {
      testName: test.fullTitle(),
      testFramework: 'Mocha',
      fileName: test.file,
      outcome: test.state === 'passed' ? 'Passed' : undefined,
      durationMilliseconds: test.duration
    }
  }

  runner.on('pass', function(test){
    tests.push(mapTest(test))
  })

  runner.on('pending', function(mochaTest) {
    var test = mapTest(mochaTest)
    test.outcome = 'Ignored'
    tests.push(test)
  })

  runner.on('fail', function(mochaTest, err) {
    var test = mapTest(mochaTest)
    test.outcome = 'Failed'
    test.ErrorMessage = err.message
    test.ErrorStackTrace = err.stack
    tests.push(test)
  })

  runner.on('end', function(failures) {
    console.log('here')

    if (typeof XMLHttpRequest !== 'undefined') {
      var xmlhttp = new XMLHttpRequest()
      /*xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 ) {
          // done
        }
      }*/

      console.log('got xmlhttp')
      console.log(process)
      console.log('process did not barf')
      console.log(process.env)
      console.log('process.env did not barf')
      console.log(process.env.APPVEYOR_API_URL)
      console.log('appveyor_api_url did not barf')

      xmlhttp.open('PUT', process.env.APPVEYOR_API_URL + '/api/tests/batch', false)
      xmlhttp.setRequestHeader('Content-type', 'application/json')
      xmlhttp.send('[' +
        '{' +
            '\"testName\": \"Test A\",' +
            '\"outcome\": \"Passed\",' +
            '"durationMilliseconds\": \"1200\"' +
        '},' +
        '{' +
            '"testName\": \"Test B\",' +
            '"outcome\": \"Passed\",' +
            '"durationMilliseconds\": \"10\"' +
        '}' +
      ']')

      console.log(JSON.stringify(tests))
      xmlhttp.open('PUT', process.env.APPVEYOR_API_URL + '/api/tests/batch', false)
      xmlhttp.setRequestHeader('Content-type', 'application/json')
      xmlhttp.send(JSON.stringify(tests))

      console.log('nearly done')
      xmlhttp.open('PUT', process.env.APPVEYOR_API_URL + '/api/tests/batch', false)
      xmlhttp.setRequestHeader('Content-type', 'application/json')
      xmlhttp.send(tests)
      console.log('did I get here')
    } else {
      console.log('else')
      require('request-json').newClient(process.env.APPVEYOR_API_URL).post('api/tests/batch', tests, function(err, body, resp) {
        process.exit(tests.filter(function(t) { return t.outcome === 'Failed' }).length || (err ? -1 : 0))
      })
    }
  })
}

module.exports = AppVeyorReporter