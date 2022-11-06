#make sure to run pip install bigml

from bigml.deepnet import Deepnet
from bigml.api import BigML
# Downloads and generates a local version of the DEEPNET,
# if it hasn't been downloaded previously.
deepnet = Deepnet('deepnet/6367247c8be2aa364c004715',
                  api=BigML("owenstuartlee",
                            "7815bbbc18255864b0df322cd83c8723b7a4f68b",
                            domain="bigml.io"))
# To make predictions fill the desired input_data in next line.
comment='''We need to address crime on our streets. Abortion should be illegal. I love Donald Trump. God, the church, censorship, free speech.'''
input_data = {
    "Tweet": comment
}
print([deepnet.predict(input_data, full=True)])
#
# input_data: dict for the input values
# (e.g. {"petal length": 1, "sepal length": 3})
# full: if set to True, the output will be a dictionary that includes all the
# available information about the prediction. The attributes vary depending
# on the ensemble type. Please check:
# https://bigml.readthedocs.io/en/latest/#local-deepnet-predictions

#Donald Trump is the greatest. Joe Biden is a stinky old man. I hate smelly people. Joe Biden is the smelliest person that I hate. Guns, babies, god, jesus, family. Bless the church. Snowflakes should burn. Amen. and God Bless America.