#!/bin/bash
git add .
git commit -a -m 'update'
git push  #--set-upstream origin master
echo '!!!'
#bundle exec  ejekyll
bundle exec jekyll build
echo '!!!'
cd _site
#rm Gem*
#rm git.sh
git init
git add .
git commit -m 'update'
#git push --set-upstream origin master
git remote add origin git@github.com:Ethanol/ethanol.github.com.git
git push --set-upstream origin master #-f
