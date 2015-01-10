    git checkout master
    ls -al 
    git rm .fuse_hidden*

    git checkout source
    jekyll build
    git rm .fuse_hidden*

    git add -A
    git commit -m "update source"

    cp -r _site/ /tmp/
    rm -r /tmp/_site
    cp -r _site/ /tmp

    git checkout master
    cp -rf /tmp/_site/* ./    

    git add -A
    git commit -m "update blog"
    git push origin master

    git checkout source
    echo "deploy succeed"
    git push origin source
    echo "push source"