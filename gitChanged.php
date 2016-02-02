<?php

	echo "git repository changed, it need a pull\n";
	$Name = $argv[1];
	echo $Name."\n";
	$RepoUrl = "https://github.com/maplefu0602/".$Name.".git";
	$Dir = $Name;

	function gitClone($url, $name) {
		$cmd = "git clone ".$url." ".$name;
		echo $cmd."\n";
		echo shell_exec($cmd." 2>&1; echo $?\n");
	}

	function gitPull($name) {
		$cmd = "git --git-dir=".$name."/.git checkout && git --git-dir=".$name."/.git pull";
		echo shell_exec($cmd." 2>&1;echo $?\n");
	}

	//echo shell_exec("ls -l 2>&1; echo $?");
	function getRepository($RepoUrl, $Dir) {
		if(file_exists($Dir)) {
			echo "Folder ".$Dir." exists, need git pull.\n";
			gitPull($Dir);
		} else {
			echo "Folder ".$Dir."is not there, need git clone.\n";
			gitClone($RepoUrl, $Dir);
		}
	}
	getRepository($RepoUrl, $Dir);
?>

