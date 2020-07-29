clear

#Set NODE_ENV
if [[ "$1" == "test" ]]
then
    env="pipeline"
else
    env="test"
fi

export NODE_ENV=$env

# In band with coverage
# jest --forceExit --runInBand
jest --forceExit --runInBand --coverage --forceExit
#jest --forceExit --runInBand --coverage
# jest test/examQuestion.e2e-spec  --runInBand --forceExit
#--detectOpenHandles


# // "test:e2e": "bash ./test/test.sh",